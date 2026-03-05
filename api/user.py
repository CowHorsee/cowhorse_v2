import logging
import json
import os
import bcrypt
import uuid
from datetime import datetime
from azure.data.tables import TableServiceClient
import azure.functions as func
from azure_functions_openapi.decorator import openapi

bp = func.Blueprint(name='user', url_prefix='/api/user')
USERS_TABLE_NAME = "Users"


def _get_users_table_client():
    conn_str = os.environ["AZURE_STORAGE_CONNECTION_STRING"]
    table_service = TableServiceClient.from_connection_string(conn_str)
    return table_service.get_table_client(USERS_TABLE_NAME)


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
        "required": ["name", "role", "password"],
        "properties": {
            "name": {"type": "string"},
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

    # -------------------------
    # 1. EXTRACT
    # -------------------------
    try:
        body = req.get_json()
        name = body.get("name")
        role = body.get("role")
        password = body.get("password")
    except Exception:
        return func.HttpResponse("Invalid JSON body", status_code=400)

    if not all([name, role, password]):
        return func.HttpResponse("Missing required fields", status_code=400)

    # -------------------------
    # 2. TRANSFORM
    # -------------------------

    # Normalize
    user_id = str(uuid.uuid4())
    name = name.strip().title()
    role = role.strip().upper()

    # Validate role
    allowed_roles = ["ADMIN", "EMPLOYEE", "MANAGER"]
    if role not in allowed_roles:
        return func.HttpResponse("Invalid role", status_code=400)

    # Hash password
    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    hashed_pw_str = hashed_pw.decode("utf-8")

    created_at = datetime.utcnow().isoformat()

    entity = {
        "PartitionKey": "USER",
        "RowKey": user_id,
        "name": name,
        "role": role,
        "password_hash": hashed_pw_str,
        "created_at": created_at
    }

    # -------------------------
    # 3. LOAD
    # -------------------------
    try:
        table_client = _get_users_table_client()
    except KeyError:
        return func.HttpResponse("Storage connection is not configured", status_code=500)
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse("Failed to initialize storage client", status_code=500)

    try:
        table_client.create_entity(entity=entity)
    except Exception as e:
        if getattr(e, "status_code", None) == 409:
            return func.HttpResponse("User already exists", status_code=409)
        logging.error(str(e))
        return func.HttpResponse("Failed to register user", status_code=500)

    return func.HttpResponse(
        json.dumps({
            "message": "User registered successfully",
            "user_id": user_id
        }),
        status_code=201,
        mimetype="application/json"
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
