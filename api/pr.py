import json
import logging
import os
import uuid
from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any

import azure.functions as func
from azure.data.tables import TableServiceClient
from azure_functions_openapi.decorator import openapi
from models.pr_models import CreatePrRequest, CreatePrResponse

bp = func.Blueprint(name='pr', url_prefix='/api/pr')


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_bad_request(message: str) -> func.HttpResponse:
    return func.HttpResponse(message, status_code=400)


def _validate_and_build_request(body: Any) -> tuple[CreatePrRequest | None, str | None]:
    if not isinstance(body, dict):
        return None, 'JSON body must be an object'

    required_fields = ['created_by', 'title', 'department', 'justification', 'items']
    for field in required_fields:
        value = body.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            return None, f'Missing required field: {field}'

    items = body.get('items')
    if not isinstance(items, list) or not items:
        return None, 'items must be a non-empty array'

    normalized_items: list[dict[str, Any]] = []
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            return None, f'items[{index}] must be an object'

        description = item.get('description')
        quantity = item.get('quantity')
        unit_price = item.get('unit_price')
        item_currency = item.get('currency') or body.get('currency') or 'MYR'

        if not isinstance(description, str) or not description.strip():
            return None, f'items[{index}].description is required'

        if not isinstance(quantity, (int, float)) or quantity <= 0:
            return None, f'items[{index}].quantity must be > 0'

        if not isinstance(unit_price, (int, float)) or unit_price < 0:
            return None, f'items[{index}].unit_price must be >= 0'

        normalized_items.append(
            {
                'description': description.strip(),
                'quantity': float(quantity),
                'unit_price': float(unit_price),
                'currency': str(item_currency).upper(),
                'line_total': round(float(quantity) * float(unit_price), 2),
            }
        )

    created_by = str(body.get('created_by')).strip()
    modified_by = str(body.get('modified_by') or created_by).strip()
    title = str(body.get('title')).strip()
    department = str(body.get('department')).strip()
    justification = str(body.get('justification')).strip()
    needed_by = body.get('needed_by')
    vendor = body.get('vendor')
    currency = str(body.get('currency') or 'MYR').upper()

    model = CreatePrRequest(
        created_by=created_by,
        modified_by=modified_by,
        title=title,
        department=department,
        justification=justification,
        items=normalized_items,
        needed_by=str(needed_by).strip() if isinstance(needed_by, str) and needed_by.strip() else None,
        vendor=str(vendor).strip() if isinstance(vendor, str) and vendor.strip() else None,
        currency=currency,
    )

    return model, None


@bp.route(route='create', methods=['POST'], auth_level=func.AuthLevel.FUNCTION)
@openapi(
    summary='Create purchase requisition',
    description='Create a PR record with request metadata and line items in Azure Table Storage.',
    tags=['PR'],
    operation_id='createPr',
    route='/api/pr/create',
    method='post',
    request_body={
        'type': 'object',
        'required': ['created_by', 'title', 'department', 'justification', 'items'],
        'properties': {
            'created_by': {'type': 'string'},
            'modified_by': {'type': 'string'},
            'title': {'type': 'string'},
            'department': {'type': 'string'},
            'justification': {'type': 'string'},
            'needed_by': {'type': 'string', 'description': 'ISO date string'},
            'vendor': {'type': 'string'},
            'currency': {'type': 'string', 'default': 'MYR'},
            'items': {
                'type': 'array',
                'minItems': 1,
                'items': {
                    'type': 'object',
                    'required': ['description', 'quantity', 'unit_price'],
                    'properties': {
                        'description': {'type': 'string'},
                        'quantity': {'type': 'number', 'minimum': 0.01},
                        'unit_price': {'type': 'number', 'minimum': 0},
                        'currency': {'type': 'string'},
                    },
                },
            },
        },
    },
    response={
        201: {'description': 'PR created successfully'},
        400: {'description': 'Invalid request body'},
        500: {'description': 'Failed to create PR'},
    },
)
def create_pr(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing PR create request.')

    try:
        body = req.get_json()
    except Exception:
        return _to_bad_request('Invalid JSON body')

    request_model, validation_error = _validate_and_build_request(body)
    if validation_error:
        return _to_bad_request(validation_error)

    if request_model is None:
        return _to_bad_request('Invalid request body')

    pr_id = str(uuid.uuid4())
    created_at = _utc_now_iso()
    updated_at = created_at
    total_amount = round(sum(item['line_total'] for item in request_model.items), 2)

    response_model = CreatePrResponse(
        id=pr_id,
        created_by=request_model.created_by,
        modified_by=request_model.modified_by,
        title=request_model.title,
        department=request_model.department,
        justification=request_model.justification,
        needed_by=request_model.needed_by,
        vendor=request_model.vendor,
        currency=request_model.currency,
        status='SUBMITTED',
        item_count=len(request_model.items),
        total_amount=total_amount,
        created_at=created_at,
        updated_at=updated_at,
    )

    entity = {
        'PartitionKey': 'PR',
        'RowKey': response_model.id,
        'created_by': response_model.created_by,
        'modified_by': response_model.modified_by,
        'title': response_model.title,
        'department': response_model.department,
        'justification': response_model.justification,
        'needed_by': response_model.needed_by or '',
        'vendor': response_model.vendor or '',
        'currency': response_model.currency,
        'status': response_model.status,
        'item_count': response_model.item_count,
        'total_amount': response_model.total_amount,
        'items': json.dumps(request_model.items),
        'created_at': response_model.created_at,
        'updated_at': response_model.updated_at,
    }

    try:
        conn_str = os.environ['AZURE_STORAGE_CONNECTION_STRING']
        table_service = TableServiceClient.from_connection_string(conn_str)
        table_client = table_service.get_table_client('PurchaseRequisitions')
        table_client.create_table_if_not_exists()
        table_client.create_entity(entity=entity)
    except KeyError:
        return func.HttpResponse('Storage connection is not configured', status_code=500)
    except Exception as error:
        logging.error(str(error))
        return func.HttpResponse('Failed to create PR', status_code=500)

    return func.HttpResponse(
        json.dumps(asdict(response_model)),
        status_code=201,
        mimetype='application/json',
    )
