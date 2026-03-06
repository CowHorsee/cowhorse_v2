from azure.data.tables import TableClient
import json, os
import azure.functions as func
from azure_functions_openapi.decorator import openapi

bp = func.Blueprint(name='user', url_prefix='/api/user')

@bp.route(route="users/bulk", methods=["POST"])
def bulk_insert_users(req: func.HttpRequest) -> func.HttpResponse:

    entities = req.get_json()

    table = TableClient.from_connection_string(
        conn_str=os.environ["AZURE_STORAGE_CONNECTION_STRING"],
        table_name="user"
    )

    table.create_table_if_not_exists()

    for e in entities:
        table.upsert_entity(entity=e)

    return func.HttpResponse(
        json.dumps({"message": "Data inserted successfully"}),
        status_code=201,
        mimetype="application/json"
    )