import logging
import json
import azure.functions as func
from azure_functions_openapi.decorator import openapi
from .scripts.user_management import login, register, forget_password, modify_role, change_password, search_user

bp = func.Blueprint(name='user_v2', url_prefix='/api/user')

@bp.route(route="login", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Login user",
    tags=["User Management"],
    request_body={"type": "object", "required": ["email", "password"], "properties": {"email": {"type": "string"}, "password": {"type": "string"}}},
    response={200: {"description": "Login successful"}, 401: {"description": "Invalid credentials"}}
)
def api_login(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        email, password = body.get('email'), body.get('password')
        role, user_id, msg = login(email, password)
        if "Successful" in msg:
            return func.HttpResponse(json.dumps({"role": role, "user_id": user_id, "message": msg}), status_code=200, mimetype="application/json")
        return func.HttpResponse(msg, status_code=401)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="register", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Register user",
    tags=["User Management"],
    request_body={"type": "object", "required": ["admin_id", "email", "name", "role_name"], "properties": {"admin_id": {"type": "string"}, "email": {"type": "string"}, "name": {"type": "string"}, "role_name": {"type": "string"}, "password": {"type": "string"}}},
    response={200: {"description": "Registration successful"}, 403: {"description": "Access denied"}}
)
def api_register(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = register(body.get('admin_id'), body.get('email'), body.get('name'), body.get('role_name'), body.get('password'))
        status = 200 if "Successful" in result else 403
        return func.HttpResponse(result, status_code=status)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="forget_password", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Reset user password",
    tags=["User Management"],
    request_body={"type": "object", "required": ["user_id"], "properties": {"user_id": {"type": "string"}}},
    response={200: {"description": "Reset successful"}}
)
def api_forget_password(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = forget_password(body.get('user_id'))
        return func.HttpResponse(result, status_code=200 if "Success" in result else 400)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="modify_role", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Modify user role",
    tags=["User Management"],
    request_body={"type": "object", "required": ["admin_id", "user_id", "new_role_name"], "properties": {"admin_id": {"type": "string"}, "user_id": {"type": "string"}, "new_role_name": {"type": "string"}}},
    response={200: {"description": "Update successful"}}
)
def api_modify_role(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = modify_role(body.get('admin_id'), body.get('user_id'), body.get('new_role_name'))
        return func.HttpResponse(result, status_code=200 if "Success" in result else 403)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="change_password", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Change user password",
    tags=["User Management"],
    request_body={"type": "object", "required": ["user_id", "old_password", "new_password"], "properties": {"user_id": {"type": "string"}, "old_password": {"type": "string"}, "new_password": {"type": "string"}}},
    response={200: {"description": "Change successful"}}
)
def api_change_password(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = change_password(body.get('user_id'), body.get('old_password'), body.get('new_password'))
        return func.HttpResponse(result, status_code=200 if "Success" in result else 401)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="search_user", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Search users",
    tags=["User Management"],
    response={200: {"description": "Search complete"}}
)
def api_search_user(req: func.HttpRequest) -> func.HttpResponse:
    try:
        email = req.params.get('email')
        name = req.params.get('name')
        role_name = req.params.get('role_name')
        result = search_user(email, name, role_name)
        return func.HttpResponse(json.dumps(result), status_code=200, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)
