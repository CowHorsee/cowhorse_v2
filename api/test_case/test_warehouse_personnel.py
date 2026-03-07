import sys
import os

os.environ["TESTING"] = "true"

# Add the project root to sys.path to allow imports from api
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from api.scripts.user_management import login
from api.scripts.puchase_order import get_po_ticket, get_po_details, update_po_status
from api.scripts.uat_warehouse_management import count_inventory, update_inventory

# Warehouse Personnel ID (Wei from user.csv)
WAREHOUSE_ID = "444e4567-e89b-12d3-a456-426614174000"
WAREHOUSE_EMAIL = "wei@fiamma.com.my"
TEST_PO_ID = "PO_202603_00001"
# Supplier ID (needed for get_po_ticket as per currently implemented script)
SUPPLIER_ID_DUMMY = "888e4567-e89b-12d3-a456-426614174001"
INCOMING_CSV = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dataset', 'incoming_stock.csv'))

def run_tests():
    print("--- 1. Login Account ---")
    role, user_id, msg = login(WAREHOUSE_EMAIL, "password123")
    print(f"Login Result: {msg}, Role: {role}, User ID: {user_id}")

    print("\n--- 2. Get PO Ticket ---")
    # Search by status = shipped (7), arrived (8)
    print("Search by status (using Supplier ID as current script requires it):")
    print(get_po_ticket(SUPPLIER_ID_DUMMY)) 

    print("\n--- 3. Update PO Status to Received ---")
    print(update_po_status(WAREHOUSE_ID, TEST_PO_ID, "Order Received"))

    print("\n--- 4. Get PO Details ---")
    print(get_po_details(WAREHOUSE_ID, TEST_PO_ID))

    print("\n--- 5. Count Inventory ---")
    print(count_inventory())

    print("\n--- 6. Update Inventory ---")
    print(update_inventory(INCOMING_CSV))

    print("\n--- 7. Count Inventory (Verified) ---")
    print("By default:")
    print(count_inventory())
    print("\nBy item_name (Brake Pad):")
    print(count_inventory(item_name="Brake Pad"))

if __name__ == "__main__":
    run_tests()
