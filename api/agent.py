import os
import json
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    api_version="2024-02-01"
)

# Tool definitions
tools = [
    {"type": "web_search"},  # built-in
    {
        "type": "function",
        "function": {
            "name": "getInventoryStatus",
            "description": "Fetch inventory details for items",
            "parameters": {
                "type": "object",
                "properties": {"item_id": {"type": "string"}},
                "required": ["item_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "createPurchaseRequest",
            "description": "Create PR for items flagged by agent",
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

# Agent instruction / prompt
system_instruction = """
You are an autonomous procurement agent.
1. Check inventory for all items.
2. If stock is below reorder threshold, assess market/supplier risk.
3. Use web search if needed.
4. If risk acceptable, create a purchase request using createPurchaseRequest.
5. Return structured output including action_taken, items_checked, and market_risk_summary.
"""

# Single run execution
response = client.responses.create(
    model="gpt-4.1",
    tools=tools,
    input=system_instruction,
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "procurement_agent_output",
            "schema": {
                "type": "object",
                "properties": {
                    "action_taken": {"type": "string"},
                    "items_checked": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "item_id": {"type": "string"},
                                "current_stock": {"type": "integer"},
                                "reorder_threshold": {"type": "integer"},
                                "below_threshold": {"type": "boolean"}
                            },
                            "required": ["item_id", "current_stock", "reorder_threshold", "below_threshold"]
                        }
                    },
                    "market_risk_summary": {"type": "string"}
                },
                "required": ["action_taken", "items_checked", "market_risk_summary"]
            }
        }
    }
)

# Get structured JSON output
agent_output = response.output[0].content[0].text
result = json.loads(agent_output)
print(result)