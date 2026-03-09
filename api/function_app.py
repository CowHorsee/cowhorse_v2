import azure.functions as func
import logging
from azure_functions_openapi.openapi import get_openapi_json
from azure_functions_openapi.swagger_ui import render_swagger_ui


from api_data_loader import bp as loader_blueprint
from api_user_management import bp as user_v2_blueprint
from api_purchase_request import bp as pr_api_blueprint
from api_purchase_order import bp as po_api_blueprint
from api_warehouse import bp as warehouse_api_blueprint

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)
app.register_blueprint(loader_blueprint)
app.register_blueprint(user_v2_blueprint)  
app.register_blueprint(pr_api_blueprint)
app.register_blueprint(po_api_blueprint)
app.register_blueprint(warehouse_api_blueprint)


@app.route(route="openapi.json", auth_level=func.AuthLevel.ANONYMOUS)
def openapi_json(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        get_openapi_json(title="CowHorse API", version="1.0.0"),
        mimetype="application/json",
    )


@app.route(route="docs", auth_level=func.AuthLevel.ANONYMOUS)
def docs(req: func.HttpRequest) -> func.HttpResponse:
    return render_swagger_ui(title="CowHorse API Docs", openapi_url="/api/openapi.json")
