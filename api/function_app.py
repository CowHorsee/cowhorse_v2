import azure.functions as func
import logging
from azure_functions_openapi.openapi import get_openapi_json
from azure_functions_openapi.swagger_ui import render_swagger_ui

from pr import bp as pr_blueprint
from user import bp as user_blueprint

app = func.FunctionApp()
app.register_blueprint(user_blueprint)
app.register_blueprint(pr_blueprint)


@app.route(route="openapi.json", auth_level=func.AuthLevel.ANONYMOUS)
def openapi_json(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        get_openapi_json(title="CowHorse API", version="1.0.0"),
        mimetype="application/json",
    )


@app.route(route="docs", auth_level=func.AuthLevel.ANONYMOUS)
def docs(req: func.HttpRequest) -> func.HttpResponse:
    return render_swagger_ui(title="CowHorse API Docs",openapi_url="/api/openapi.json")
