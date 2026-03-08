import logging
import json
import azure.functions as func
from azure_functions_openapi.decorator import openapi
from scripts.uat_warehouse_management import count_inventory, update_inventory

bp = func.Blueprint(name='warehouse_api', url_prefix='/api/warehouse')

@bp.route(route="count_inventory", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Count inventory",
    tags=["Warehouse"],
    response={200: {"description": "Inventory count retrieved"}}
)
def api_count_inventory(req: func.HttpRequest) -> func.HttpResponse:
    try:
        item_name = req.params.get('item_name')
        result = count_inventory(item_name)
        return func.HttpResponse(json.dumps(result), status_code=200, mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)

@bp.route(route="update_inventory", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Update inventory from CSV",
    tags=["Warehouse"],
    request_body={"type": "object", "required": ["incoming_csv_path"], "properties": {"incoming_csv_path": {"type": "string"}}},
    response={200: {"description": "Inventory updated"}}
)
def api_update_inventory(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
        result = update_inventory(body.get('incoming_csv_path'))
        return func.HttpResponse(result, status_code=200 if "item_id" in result else 400)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)
