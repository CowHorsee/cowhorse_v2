import logging
import json
import azure.functions as func
from azure_functions_openapi.decorator import openapi
from .scripts.purchase_request import (
    create_pr, accept_pr_suggestion, modify_pr, 
    get_pr_ticket, get_pr_details, review_pr, procurement_alert
)

bp = func.Blueprint(name='purchase_request_api', url_prefix='/api/pr')

@bp.route(route="create_pr", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Create purchase request",
    tags=["Purchase Request"],
    request_body={"type": "object", "required": ["user_id", "proc_item", "justification"], "properties": {"user_id": {"type": "string"}, "proc_item": {"type": "object"}, "justification": {"type": "string"}}},
    response={200: {"description": "PR created successfully"}}
)
def api_create_pr(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = create_pr(body.get('user_id'), body.get('proc_item'), body.get('justification'))
        return func.HttpResponse(json.dumps(result), status_code=200, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="accept_pr_suggestion", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Accept AI PR suggestion",
    tags=["Purchase Request"],
    request_body={"type": "object", "required": ["pr_id", "officer_id"], "properties": {"pr_id": {"type": "string"}, "officer_id": {"type": "string"}}},
    response={200: {"description": "PR accepted"}}
)
def api_accept_pr_suggestion(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = accept_pr_suggestion(body.get('pr_id'), body.get('officer_id'))
        return func.HttpResponse(result, status_code=200 if "Success" in result else 400)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="modify_pr", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Modify purchase request",
    tags=["Purchase Request"],
    request_body={"type": "object", "required": ["user_id", "pr_id", "proc_item", "justification"], "properties": {"user_id": {"type": "string"}, "pr_id": {"type": "string"}, "proc_item": {"type": "object"}, "justification": {"type": "string"}}},
    response={200: {"description": "PR modified"}}
)
def api_modify_pr(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = modify_pr(body.get('user_id'), body.get('pr_id'), body.get('proc_item'), body.get('justification'))
        return func.HttpResponse(result, status_code=200 if "Success" in result else 400)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="get_pr_ticket", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Get PR tickets",
    tags=["Purchase Request"],
    response={200: {"description": "Tickets retrieved"}}
)
def api_get_pr_ticket(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user_id = req.params.get('user_id')
        pr_id = req.params.get('pr_id')
        status = req.params.get('status')
        result = get_pr_ticket(user_id, pr_id, status)
        return func.HttpResponse(json.dumps(result), status_code=200, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="get_pr_details", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Get PR details",
    tags=["Purchase Request"],
    response={200: {"description": "Details retrieved"}}
)
def api_get_pr_details(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user_id = req.params.get('user_id')
        pr_id = req.params.get('pr_id')
        result = get_pr_details(user_id, pr_id)
        return func.HttpResponse(json.dumps(result), status_code=200, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="review_pr", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Review purchase request",
    tags=["Purchase Request"],
    request_body={"type": "object", "required": ["pr_id", "decision", "manager_id"], "properties": {"pr_id": {"type": "string"}, "decision": {"type": "string"}, "manager_id": {"type": "string"}}},
    response={200: {"description": "Review complete"}}
)
def api_review_pr(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = review_pr(body.get('pr_id'), body.get('decision'), body.get('manager_id'))
        return func.HttpResponse(result, status_code=200 if "Success" in result or " PR " in result else 400)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="procurement_alert", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Trigger procurement alert (AI)",
    tags=["Purchase Request"],
    request_body={"type": "object", "required": ["item_name", "predicted_demand", "justification"], "properties": {"item_name": {"type": "string"}, "predicted_demand": {"type": "number"}, "justification": {"type": "string"}}},
    response={200: {"description": "Alert processed"}}
)
def api_procurement_alert(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = procurement_alert(body.get('item_name'), body.get('predicted_demand'), body.get('justification'))
        return func.HttpResponse(json.dumps(result) if isinstance(result, dict) else result, status_code=200)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)
