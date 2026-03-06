import json
from azure.data.tables import TableClient
import os

conn_str = os.environ["AZURE_STORAGE_CONNECTION_STRING"]
table = TableClient.from_connection_string(conn_str, "user")

with open("dataset/user.json") as f:
    entities = json.load(f)

for e in entities:
    table.upsert_entity(e)