import sys
import os

os.environ["TESTING"] = "true"

# Add the api directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.user_management import login
from scripts.purchase_order import create_po

# Officer ID (Raju from user.csv)
OFFICER_ID = "dd4f18d8-3859-490f-88fd-330203e15be2"
OFFICER_EMAIL = "johndoe@company.com"
TEST_PR_ID = "PR_202603_00001" # Approved PR

def run_tests():
    print("--- 1. Login Account ---")
    role, user_id, msg = login(OFFICER_EMAIL, "47bfdea2")
    print(f"Login Result: {msg}, Role: {role}, User ID: {user_id}")

    print("\n--- 2. Create PO ---")
    # proc_item example: [{"ITM_001": 10, "ITM_002": 5}, {"ITM_003": 2}]
    # Using item IDs from item.csv
    proc_item = [{"ITM_00001": 10, "ITM_00002": 5}]
    print(create_po(TEST_PR_ID, proc_item, OFFICER_ID))

if __name__ == "__main__":
    run_tests()