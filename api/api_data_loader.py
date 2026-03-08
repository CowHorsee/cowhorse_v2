import logging
import json
import os
import pandas as pd
import uuid
from azure.data.tables import TableServiceClient
import azure.functions as func
from azure_functions_openapi.decorator import openapi

bp = func.Blueprint(name='data_loader', url_prefix='/api/data-loader')

def _get_table_service_client():
    conn_str = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
    if not conn_str:
        raise ValueError("AZURE_STORAGE_CONNECTION_STRING is not set.")
    return TableServiceClient.from_connection_string(conn_str)

@bp.route(route="run", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
@openapi(
    summary="Migrate CSV datasets to Azure Table Storage",
    description="Iterates through all CSV files in api/dataset/ and uploads them to Azure Storage Tables.",
    tags=["Maintenance"],
    operation_id="runDataLoader",
    response={
        200: {"description": "Datasets loaded successfully"},
        500: {"description": "Failed to load datasets"},
    },
)
def run_data_loader(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Starting data loading process.")
    
    dataset_dir = os.path.join(os.path.dirname(__file__), 'dataset')
    if not os.path.exists(dataset_dir):
        return func.HttpResponse(f"Dataset directory not found at {dataset_dir}", status_code=500)

    results = {}
    try:
        service_client = _get_table_service_client()
        
        for filename in os.listdir(dataset_dir):
            if filename.endswith(".csv"):
                logical_name = filename.replace(".csv", "")
                # Azure Table names must be alphanumeric
                table_name = logical_name.replace("_", "")
                csv_path = os.path.join(dataset_dir, filename)
                
                # Load CSV
                df = pd.read_csv(csv_path)
                
                # Identify ID column for RowKey
                id_col = None
                for col in df.columns:
                    if col.endswith("_id") or col == "id":
                        id_col = col
                        break
                
                table_client = service_client.get_table_client(table_name)
                try:
                    table_client.create_table()
                except Exception:
                    # Table might already exist
                    pass

                rows_loaded = 0
                for index, row in df.iterrows():
                    entity = row.to_dict()
                    
                    # Azure Table Storage Requirements
                    entity["PartitionKey"] = "DATA"
                    if id_col and pd.notna(row[id_col]):
                        entity["RowKey"] = str(row[id_col])
                    else:
                        entity["RowKey"] = f"row_{index}"
                    
                    # Convert any non-serializable types (like NaN) to None for Azure
                    for key, val in entity.items():
                        if pd.isna(val):
                            entity[key] = None
                        elif isinstance(val, (int, float)) and not isinstance(val, bool):
                            # Ensure numeric values are preserved, but pandas sometimes uses numpy types
                            entity[key] = val

                    table_client.upsert_entity(entity=entity)
                    rows_loaded += 1
                
                results[table_name] = f"Loaded {rows_loaded} rows."

        return func.HttpResponse(
            json.dumps({"message": "Data migration complete", "details": results}, indent=2),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error during data loading: {str(e)}")
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
