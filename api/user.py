import logging
import json
import os
import bcrypt
import uuid
from datetime import datetime
from azure.data.tables import TableServiceClient
import azure.functions as func
from azure_functions_openapi.decorator import openapi

app = func.FunctionApp()
app.register_blueprint(func.Blueprint(name="user", url_prefix="/api/user"))


@bp.route(route="user/register", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Register user",
    description="Create a user record and persist hashed password in Azure Table Storage.",
    tags=["User"],
    operation_id="registerUser",
    route="/api/user/register",
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
    table_client = None
    try:
        conn_str = os.environ["AZURE_STORAGE_CONNECTION_STRING"]
        table_service = TableServiceClient.from_connection_string(conn_str)
        table_client = table_service.get_table_client("Users")
        table_client.create_table_if_not_exists()
    except KeyError:
        return func.HttpResponse("Storage connection is not configured", status_code=500)
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse("Failed to initialize storage client", status_code=500)

    if table_client is None:
        return func.HttpResponse("Failed to initialize storage client", status_code=500)

    try:
        table_client.create_entity(entity=entity)
    except Exception as e:
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
