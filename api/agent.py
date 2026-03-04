import os
import json
import requests
from urllib.parse import urlparse
import azure.functions as func
from dotenv import load_dotenv
from openai import AzureOpenAI
from azure_functions_openapi.decorator import openapi

load_dotenv()

bp = func.Blueprint(name='agent', url_prefix='/api/agent')


def _build_client() -> AzureOpenAI:
    return AzureOpenAI(
        api_key=os.getenv('AZURE_OPENAI_API_KEY'),
        azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
        api_version='2024-06-01',
    )

DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")

# Tool definitions exposed to LLM
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_inventory_status",
            "description": "Fetch inventory details from backend service",
            "parameters": {
                "type": "object",
                "properties": {
                    "item_id": {"type": "string"}
                },
                "required": ["item_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_purchase_request",
            "description": "Create a purchase request in procurement system",
            "parameters": {
                "type": "object",
                "properties": {
                    "item_id": {"type": "string"},
                    "quantity": {"type": "integer"}
                },
                "required": ["item_id", "quantity"]
            }
        }
    }
]


# ---- HTTP Tool Executor ----

def call_backend_tool(tool_name, arguments, base_url=None):
    resolved_base_url = base_url or os.getenv('BACKEND_BASE_URL')
    if not resolved_base_url:
        return {'error': 'BACKEND_BASE_URL is not configured'}

    if tool_name == "get_inventory_status":
        url = f"{resolved_base_url}/get-inventory"
        response = requests.post(url, json=arguments)

    elif tool_name == "create_purchase_request":
        url = f"{resolved_base_url}/create-pr"
        response = requests.post(url, json=arguments)

    else:
        return {"error": "Unknown tool"}

    return response.json()


# ---- Agent Runner ----

def run_procurement_agent(item_id: str, base_url=None):
    client = _build_client()

    system_prompt = """
    You are a procurement decision agent.
    1. Always call get_inventory_status first.
    2. If current_stock < reorder_threshold, call create_purchase_request.
    3. Otherwise, explain why no PR is needed.
    """

    response = client.chat.completions.create(
        model=DEPLOYMENT,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Evaluate procurement need for item: {item_id}"}
        ],
        tools=tools
    )

    message = response.choices[0].message

    if message.tool_calls:
        tool_call = message.tool_calls[0]
        tool_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)

        # Call Azure Function endpoint
        tool_result = call_backend_tool(tool_name, arguments, base_url)

        # Send result back to LLM
        second_response = client.chat.completions.create(
            model=DEPLOYMENT,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Evaluate procurement need for item: {item_id}"},
                message,
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(tool_result)
                }
            ]
        )

        return second_response.choices[0].message.content

    return message.content


@bp.route(route='mock/get-inventory', methods=['POST'], auth_level=func.AuthLevel.ANONYMOUS)
def mock_get_inventory(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except Exception:
        body = {}
    item_id = body.get('item_id', 'UNKNOWN')

    payload = {
        'item_id': item_id,
        'current_stock': 3,
        'reorder_threshold': 10,
    }
    return func.HttpResponse(json.dumps(payload), status_code=200, mimetype='application/json')


@bp.route(route='mock/create-pr', methods=['POST'], auth_level=func.AuthLevel.ANONYMOUS)
def mock_create_pr(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except Exception:
        body = {}

    payload = {
        'ok': True,
        'pr_id': 'PR-MOCK-001',
        'item_id': body.get('item_id'),
        'quantity': body.get('quantity', 1),
        'status': 'SUBMITTED',
    }
    return func.HttpResponse(json.dumps(payload), status_code=200, mimetype='application/json')


@bp.route(route='test', methods=['GET', 'POST'], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary='Test AI connectivity',
    description='Runs a simple chat completion against the configured Azure OpenAI deployment.',
    tags=['Agent'],
    operation_id='testAiConnectivity',
    route='/api/agent/test',
    method='post',
    request_body={
        'type': 'object',
        'properties': {
            'prompt': {'type': 'string'},
        },
    },
    response={
        200: {'description': 'AI connectivity test succeeded'},
        500: {'description': 'AI connectivity test failed'},
    },
)
def test_ai(req: func.HttpRequest) -> func.HttpResponse:
    prompt = req.params.get('prompt')
    if not prompt:
        try:
            body = req.get_json()
            prompt = body.get('prompt')
        except Exception:
            prompt = None

    if not prompt:
        prompt = 'Reply with: CONNECTION_SUCCESS'

    try:
        client = _build_client()
        response = client.chat.completions.create(
            model=DEPLOYMENT,
            messages=[{'role': 'user', 'content': prompt}],
            max_tokens=64,
        )
        content = response.choices[0].message.content if response.choices else ''
        payload = {
            'ok': True,
            'deployment': DEPLOYMENT,
            'response': content,
        }
        return func.HttpResponse(json.dumps(payload), status_code=200, mimetype='application/json')
    except Exception as err:
        payload = {
            'ok': False,
            'deployment': DEPLOYMENT,
            'error': str(err),
        }
        return func.HttpResponse(json.dumps(payload), status_code=500, mimetype='application/json')


@bp.route(route='test-tools', methods=['GET', 'POST'], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary='Test AI tool-calling',
    description='Runs procurement agent flow and validates tool usage using mock tool endpoints by default.',
    tags=['Agent'],
    operation_id='testAiTools',
    route='/api/agent/test-tools',
    method='post',
    request_body={
        'type': 'object',
        'properties': {
            'item_id': {'type': 'string'},
            'base_url': {'type': 'string'},
        },
    },
    response={
        200: {'description': 'Tool test completed'},
        500: {'description': 'Tool test failed'},
    },
)
def test_tools(req: func.HttpRequest) -> func.HttpResponse:
    item_id = req.params.get('item_id')
    base_url = req.params.get('base_url')

    if not item_id or not base_url:
        try:
            body = req.get_json()
        except Exception:
            body = {}
        if not item_id:
            item_id = body.get('item_id')
        if not base_url:
            base_url = body.get('base_url')

    if not item_id:
        item_id = 'ITEM-001'

    if not base_url:
        parsed = urlparse(req.url)
        base_url = f'{parsed.scheme}://{parsed.netloc}/api/agent/mock'

    try:
        result = run_procurement_agent(item_id=item_id, base_url=base_url)
        payload = {
            'ok': True,
            'item_id': item_id,
            'base_url': base_url,
            'result': result,
        }
        return func.HttpResponse(json.dumps(payload), status_code=200, mimetype='application/json')
    except Exception as err:
        payload = {
            'ok': False,
            'item_id': item_id,
            'base_url': base_url,
            'error': str(err),
        }
        return func.HttpResponse(json.dumps(payload), status_code=500, mimetype='application/json')
