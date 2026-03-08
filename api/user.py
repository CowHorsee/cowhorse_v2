import json
import logging
import os
import uuid
from datetime import datetime

import azure.functions as func
import bcrypt
from azure.core.exceptions import ResourceNotFoundError
from azure.data.tables import TableServiceClient
from azure_functions_openapi.decorator import openapi

bp = func.Blueprint(name='user', url_prefix='/api/user')
USERS_TABLE_NAME = 'Users'
ALLOWED_ROLES = ['ADMIN', 'EMPLOYEE', 'MANAGER']


def _get_users_table_client():
    conn_str = os.environ['AZURE_STORAGE_CONNECTION_STRING']
    table_service = TableServiceClient.from_connection_string(conn_str)
    return table_service.get_table_client(USERS_TABLE_NAME)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _json_response(payload: dict, status_code: int) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(payload),
        status_code=status_code,
        mimetype='application/json',
    )


@bp.route(route="register", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Register user",
    description="Create a user record and persist hashed password in Azure Table Storage.",
    tags=["User"],
    operation_id="registerUser",
    route="/api/register",
    method="post",
    request_body={
        "type": "object",
        "required": ["name", "email", "role", "password"],
        "properties": {
            "name": {"type": "string"},
            "email": {"type": "string", "format": "email"},
            "role": {"type": "string", "enum": ["ADMIN", "EMPLOYEE", "MANAGER"]},
            "password": {"type": "string", "minLength": 8},
        },
    },
    response={
        201: {"description": "User registered successfully"},
        400: {"description": "Invalid request body or role"},
        409: {"description": "User already exists"},
        500: {"description": "Failed to register user"},
    },
)
def register_user(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Processing user registration request.")

    try:
        body = req.get_json()
        name = body.get('name')
        email = body.get('email')
        role = body.get('role')
        password = body.get('password')
    except Exception:
        return func.HttpResponse('Invalid JSON body', status_code=400)

    if not all([name, email, role, password]):
        return func.HttpResponse('Missing required fields', status_code=400)

    user_id = str(uuid.uuid4())
    normalized_name = name.strip().title()
    normalized_email = _normalize_email(email)
    normalized_role = role.strip().upper()

    if not normalized_email:
        return func.HttpResponse('Invalid email', status_code=400)

    if normalized_role not in ALLOWED_ROLES:
        return func.HttpResponse('Invalid role', status_code=400)

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    hashed_pw_str = hashed_pw.decode('utf-8')

    created_at = datetime.utcnow().isoformat()

    entity = {
        'PartitionKey': 'USER',
        'RowKey': normalized_email,
        'user_id': user_id,
        'name': normalized_name,
        'email': normalized_email,
        'role': normalized_role,
        'password_hash': hashed_pw_str,
        'created_at': created_at,
    }

    try:
        table_client = _get_users_table_client()
    except KeyError:
        return func.HttpResponse(
            'Storage connection is not configured',
            status_code=500,
        )
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse('Failed to initialize storage client', status_code=500)

    try:
        table_client.create_entity(entity=entity)
    except Exception as e:
        if getattr(e, 'status_code', None) == 409:
            return func.HttpResponse('User already exists', status_code=409)
        logging.error(str(e))
        return func.HttpResponse('Failed to register user', status_code=500)

    return _json_response(
        {
            'message': 'User registered successfully',
            'user': {
                'user_id': user_id,
                'name': normalized_name,
                'email': normalized_email,
                'role': normalized_role,
                'created_at': created_at,
            },
        },
        status_code=201,
    )


@bp.route(route='login', methods=['POST'], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary='Login user',
    description='Verify user credentials against Azure Table Storage.',
    tags=['User'],
    operation_id='loginUser',
    route='/api/user/login',
    method='post',
    request_body={
        'type': 'object',
        'required': ['email', 'password'],
        'properties': {
            'email': {'type': 'string', 'format': 'email'},
            'password': {'type': 'string', 'minLength': 8},
        },
    },
    response={
        200: {'description': 'User login successful'},
        400: {'description': 'Invalid request body'},
        401: {'description': 'Invalid credentials'},
        500: {'description': 'Failed to login user'},
    },
)
def login_user(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing user login request.')

    try:
        body = req.get_json()
        email = body.get('email')
        password = body.get('password')
    except Exception:
        return func.HttpResponse('Invalid JSON body', status_code=400)

    if not all([email, password]):
        return func.HttpResponse('Missing required fields', status_code=400)

    normalized_email = _normalize_email(email)

    try:
        table_client = _get_users_table_client()
    except KeyError:
        return func.HttpResponse(
            'Storage connection is not configured',
            status_code=500,
        )
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse('Failed to initialize storage client', status_code=500)

    try:
        user = table_client.get_entity(partition_key='USER', row_key=normalized_email)
    except ResourceNotFoundError:
        return func.HttpResponse('Invalid email or password', status_code=401)
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse('Failed to login user', status_code=500)

    stored_password_hash = user.get('password_hash', '')
    if not bcrypt.checkpw(
        password.encode('utf-8'),
        stored_password_hash.encode('utf-8'),
    ):
        return func.HttpResponse('Invalid email or password', status_code=401)

    return _json_response(
        {
            'message': 'Login successful',
            'user': {
                'user_id': user.get('user_id'),
                'name': user.get('name'),
                'email': user.get('email'),
                'role': user.get('role'),
                'created_at': user.get('created_at'),
            },
        },
        status_code=200,
    )

@bp.route(route="login", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Login user",
    description="",
    tags=["User"],
    operation_id="loginUser",
    route="/api/login",
    method="post",
    request_body={
        "type": "object",
        "required": ["email", "password"],
        "properties": {
            "email": {"type": "string"},
            "password": {"type": "string", "minLength": 8},
        },
    },
    response={
        201: {"description": "User registered successfully"},
        400: {"description": "Invalid request body or role"},
        409: {"description": "User already exists"},
        500: {"description": "Failed to register user"},
    },
)
def login_user(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Processing user login request.")

    # -------------------------
    # 1. EXTRACT
    # -------------------------
    try:
        body = req.get_json()
        email = body.get("email")
        password = body.get("password")
    except Exception:
        return func.HttpResponse("Invalid JSON body", status_code=400)

    if not all([email, password]):
        return func.HttpResponse("Missing required fields", status_code=400)

    # -------------------------
    # 2. TRANSFORM
    # -------------------------

    try:
        table_client = _get_users_table_client()
    except KeyError:
        return func.HttpResponse("Storage connection is not configured", status_code=500)
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse("Failed to initialize storage client", status_code=500)

    try:
        entities = table_client.query_entities("email eq '{email}'")
        if not entities:
            return func.HttpResponse("User not found", status_code=404)
        entity = entities[0]

        # Verify password
        if not bcrypt.checkpw(password.encode("utf-8"), entity.get("password_hash").encode("utf-8")):
            return func.HttpResponse("Invalid password", status_code=401)

        return func.HttpResponse(
            json.dumps({
                "message": "User logged in successfully",
                "user_id": entity.get("RowKey"),
                "role": entity.get("role")
            }),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse("Failed to login user", status_code=500)

@bp.route(route="users", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="List users",
    description="Read all user records from Azure Table Storage.",
    tags=["User"],
    operation_id="listUsers",
    route="/api/users",
    method="get",
    response={
        200: {"description": "Users returned successfully"},
        500: {"description": "Failed to read users"},
    },
)
def list_users(req: func.HttpRequest) -> func.HttpResponse:
    try:
        table_client = _get_users_table_client()
        entities = table_client.query_entities("PartitionKey eq 'USER'")

        users = []
        for entity in entities:
            users.append(
                {
                    "user_id": entity.get("RowKey"),
                    "name": entity.get("name"),
                    "role": entity.get("role"),
                    "created_at": entity.get("created_at"),
                }
            )

        return func.HttpResponse(
            json.dumps({"count": len(users), "users": users}),
            status_code=200,
            mimetype="application/json",
        )
    except KeyError:
        return func.HttpResponse("Storage connection is not configured", status_code=500)
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse("Failed to read users", status_code=500)

@bp.route(route="bulk", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def bulk_insert_users(req: func.HttpRequest) -> func.HttpResponse:

    json_data = [
            {
                "PartitionKey": "1",
                "RowKey": "b1c1f1c0-0001-4c9e-a001-000000000001",
                "name": "Alice Tan",
                "email": "alice@company.com",
                "password_hash": "hash_1",
                "created_at": "2026-03-01T09:00:00"
            },
            {
                "PartitionKey": "1",
                "RowKey": "b1c1f1c0-0001-4c9e-a001-000000000002",
                "name": "Brian Lee",
                "email": "brian@company.com",
                "password_hash": "hash_2",
                "created_at": "2026-03-01T09:10:00"
            },
            {
                "PartitionKey": "2",
                "RowKey": "b1c1f1c0-0001-4c9e-a001-000000000003",
                "name": "Cindy Wong",
                "email": "cindy@company.com",
                "password_hash": "hash_3",
                "created_at": "2026-03-01T09:20:00"
        },
        {
            "PartitionKey": "2",
            "RowKey": "b1c1f1c0-0001-4c9e-a001-000000000004",
            "name": "David Ng",
            "email": "david@company.com",
            "password_hash": "hash_4",
            "created_at": "2026-03-01T09:30:00"
        },
        {
            "PartitionKey": "3",
            "RowKey": "b1c1f1c0-0001-4c9e-a001-000000000005",
            "name": "Emily Lim",
            "email": "emily@company.com",
            "password_hash": "hash_5",
            "created_at": "2026-03-01T09:40:00"
        }
    ]
    entities = json_data

    table = TableClient.from_connection_string(
        conn_str=os.environ["AZURE_STORAGE_CONNECTION_STRING"],
        table_name="user"
    )

    table.create_table_if_not_exists()

    for e in entities:
        table.upsert_entity(entity=e)

    return func.HttpResponse(
        json.dumps({"message": "Data inserted successfully"}),
        status_code=201,
        mimetype="application/json"
    )