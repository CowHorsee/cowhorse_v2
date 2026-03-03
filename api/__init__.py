import azure.functions as func
from azure.functions.decorators import FunctionApp
from azure.functions.openapi import OpenApiOperation, OpenApiParameter, OpenApiRequestBody

app = FunctionApp()

# Example: register_user endpoint
@app.function_name(name="register_user")
@app.route(route="auth/register", methods=["POST"])
@OpenApiOperation(
    operation_id="RegisterUser",
    tags=["User"],
    summary="Register a new user"
)
@OpenApiRequestBody(
    content_type="application/json",
    required=True,
    description="User registration payload",
    body_type=dict
)
def register_user(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse("OK", status_code=201)