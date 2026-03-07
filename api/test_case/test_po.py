import sys
import os

# Add the project root to sys.path to allow imports from api
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from api.scripts.user_management import login
from api.scripts.puchase_order import create_po

# Officer ID (Raju from user.csv)
OFFICER_ID = "333e4567-e89b-12d3-a456-426614174000"
OFFICER_EMAIL = "raju@fiamma.com.my"
TEST_PR_ID = "PR_202603_00001" # Approved PR

def run_tests():
    print("--- 1. Login Account ---")
    role, user_id, msg = login(OFFICER_EMAIL, "password123")
    print(f"Login Result: {msg}, Role: {role}, User ID: {user_id}")

    print("\n--- 2. Create PO ---")
    # proc_item example: [{"ITM_001": 10, "ITM_002": 5}, {"ITM_003": 2}]
    # Using item IDs from item.csv
    proc_item = [{"ITM_001": 10, "ITM_002": 5}]
    print(create_po(TEST_PR_ID, proc_item, OFFICER_ID))

if __name__ == "__main__":
    run_tests()