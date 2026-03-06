from azure.data.tables import TableClient, TableServiceClient
import json, os
import azure.functions as func
from azure_functions_openapi.decorator import openapi

bp = func.Blueprint(name='user', url_prefix='/api/user')

@bp.route(route="bulk", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def bulk_insert_users(req: func.HttpRequest) -> func.HttpResponse:

    json_data = [
            {
                "PartitionKey": "1",
                "RowKey": "b1c1f1c0-0001-4c9e-a001-000000000001",
                "name": "Alice Tan",
                "email": "alice@company.com",
                "password_hash": "hash_1",
                "created_at": "2026-03-01T09:00:00"
            },
            {
                "PartitionKey": "1",
                "RowKey": "b1c1f1c0-0001-4c9e-a001-000000000002",
                "name": "Brian Lee",
                "email": "brian@company.com",
                "password_hash": "hash_2",
                "created_at": "2026-03-01T09:10:00"
            },
            {
                "PartitionKey": "2",
                "RowKey": "b1c1f1c0-0001-4c9e-a001-000000000003",
                "name": "Cindy Wong",
                "email": "cindy@company.com",
                "password_hash": "hash_3",
                "created_at": "2026-03-01T09:20:00"
        },
        {
            "PartitionKey": "2",
            "RowKey": "b1c1f1c0-0001-4c9e-a001-000000000004",
            "name": "David Ng",
            "email": "david@company.com",
            "password_hash": "hash_4",
            "created_at": "2026-03-01T09:30:00"
        },
        {
            "PartitionKey": "3",
            "RowKey": "b1c1f1c0-0001-4c9e-a001-000000000005",
            "name": "Emily Lim",
            "email": "emily@company.com",
            "password_hash": "hash_5",
            "created_at": "2026-03-01T09:40:00"
        }
    ]
    entities = json_data

    table = TableServiceClient.from_connection_string(
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