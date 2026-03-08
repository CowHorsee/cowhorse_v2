import logging
import json
import azure.functions as func
from azure_functions_openapi.decorator import openapi
from .scripts.purchase_order import create_po, get_po_ticket, get_po_details, update_po_status

bp = func.Blueprint(name='purchase_order_api', url_prefix='/api/po')

@bp.route(route="create_po", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Create purchase order",
    tags=["Purchase Order"],
    request_body={"type": "object", "required": ["pr_id", "proc_item", "user_id"], "properties": {"pr_id": {"type": "string"}, "proc_item": {"type": "array"}, "user_id": {"type": "string"}}},
    response={200: {"description": "PO created successfully"}}
)
def api_create_po(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = create_po(body.get('pr_id'), body.get('proc_item'), body.get('user_id'))
        return func.HttpResponse(str(result), status_code=200 if result else 400)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="get_po_ticket", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Get PO tickets",
    tags=["Purchase Order"],
    response={200: {"description": "Tickets retrieved"}}
)
def api_get_po_ticket(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user_id = req.params.get('user_id')
        result = get_po_ticket(user_id)
        return func.HttpResponse(json.dumps(result), status_code=200, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="get_po_details", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Get PO details",
    tags=["Purchase Order"],
    response={200: {"description": "Details retrieved"}}
)
def api_get_po_details(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user_id = req.params.get('user_id')
        po_id = req.params.get('po_id')
        result = get_po_details(user_id, po_id)
        return func.HttpResponse(json.dumps(result), status_code=200, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="update_po_status", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Update PO status",
    tags=["Purchase Order"],
    request_body={"type": "object", "required": ["supplier_id", "po_id", "status_name"], "properties": {"supplier_id": {"type": "string"}, "po_id": {"type": "string"}, "status_name": {"type": "string"}}},
    response={200: {"description": "Status updated"}}
)
def api_update_po_status(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = update_po_status(body.get('supplier_id'), body.get('po_id'), body.get('status_name'))
        return func.HttpResponse(str(result), status_code=200 if result == True else 400)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)
