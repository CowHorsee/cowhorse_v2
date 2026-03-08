import sys
import os

os.environ["TESTING"] = "true"

# Add the project root to sys.path to allow imports from api
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from api.scripts.user_management import login
from cowhorse_v2.api.scripts.purchase_order import get_po_ticket, get_po_details, update_po_status

# Supplier ID (John from user.csv)
SUPPLIER_ID = "888e4567-e89b-12d3-a456-426614174001"
SUPPLIER_EMAIL = "john@fiamma.com.my"
TEST_PO_ID = "PO_202603_00001"

def run_tests():
    print("--- 1. Login Account ---")
    role, user_id, msg = login(SUPPLIER_EMAIL, "80290066")
    print(f"Login Result: {msg}, Role: {role}, User ID: {user_id}")

    print("\n--- 2. Get PO Ticket ---")
    print("Search by supplier_id:")
    print(get_po_ticket(SUPPLIER_ID))

    print("\n--- 3. Update PO Status to Accepted ---")
    print(update_po_status(SUPPLIER_ID, TEST_PO_ID, "Order Accepted"))

    print("\n--- 4. Get PO Details ---")
    print(get_po_details(SUPPLIER_ID, TEST_PO_ID))

    print("\n--- 5. Update PO Status to Shipped ---")
    print(update_po_status(SUPPLIER_ID, TEST_PO_ID, "Order Shipped"))

    print("\n--- 6. Get PO Details ---")
    print(get_po_details(SUPPLIER_ID, TEST_PO_ID))

    print("\n--- 7. Update PO Status to Arrived ---")
    print(update_po_status(SUPPLIER_ID, TEST_PO_ID, "Order Arrived"))

    print("\n--- 8. Get PO Details ---")
    print(get_po_details(SUPPLIER_ID, TEST_PO_ID))

if __name__ == "__main__":
    run_tests()