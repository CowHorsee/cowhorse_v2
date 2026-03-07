import sys
import os

# Add the project root to sys.path to allow imports from api
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from api.scripts.user_management import login
from api.scripts.purchase_request import modify_pr, review_pr, get_pr_ticket, get_pr_details

# Manager ID (Siti from user.csv)
MANAGER_ID = "222e4567-e89b-12d3-a456-426614174000"
MANAGER_EMAIL = "siti@fiamma.com.my"
TEST_PR_ID = "PR_202603_00002"

def run_tests():
    print("--- 1. Login Account ---")
    role, user_id, msg = login(MANAGER_EMAIL, "password123") # Assuming password123 for existing users
    print(f"Login Result: {msg}, Role: {role}, User ID: {user_id}")

    print("\n--- 2. Modify PR ---")
    # Managers can modify status 2 PRs
    proc_item = {"Brake Pad": 15}
    print(modify_pr(MANAGER_ID, TEST_PR_ID, proc_item, "Modified by manager for better quantity"))

    print("\n--- 3. Review PR ---")
    print(review_pr(TEST_PR_ID, "approve", MANAGER_ID))

    print("\n--- 4. Get PR Ticket ---")
    print("Search by status (4 - Approved):")
    print(get_pr_ticket(MANAGER_ID, status=4))
    
    print("\nSearch by PR ID:")
    print(get_pr_ticket(MANAGER_ID, pr_id=TEST_PR_ID))

    print("\n--- 5. Get PR Details ---")
    print(get_pr_details(MANAGER_ID, TEST_PR_ID))

if __name__ == "__main__":
    run_tests()