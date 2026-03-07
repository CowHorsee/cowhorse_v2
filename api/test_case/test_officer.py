import sys
import os

# Add the project root to sys.path to allow imports from api
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from api.scripts.user_management import login, forget_password
from api.scripts.purchase_request import create_pr, modify_pr, get_pr_ticket, get_pr_details

# Officer ID (Raju from user.csv)
OFFICER_ID = "333e4567-e89b-12d3-a456-426614174000"
OFFICER_EMAIL = "raju@fiamma.com.my"

def run_tests():
    print("--- 1. Login Account ---")
    role, user_id, msg = login(OFFICER_EMAIL, "password123")
    print(f"Login Result: {msg}, Role: {role}, User ID: {user_id}")

    print("\n--- 2. Forget Password ---")
    print(forget_password(OFFICER_ID))

    # Note: change_password is not implemented in user_management.py
    print("\n--- 3. Change Password ---")
    print("Skipping: change_password not implemented in scripts/user_management.py")

    print("\n--- 4. Create PR ---")
    proc_item = {"Air Filter": 10, "Brake Pad": 5}
    pr_result = create_pr(OFFICER_ID, proc_item, "Monthly replenishment")
    print(pr_result)
    new_pr_id = pr_result['pr_id']

    print("\n--- 5. Modify PR ---")
    # Officers can modify status 1 PRs (AI suggestions)
    # But for testing, let's see if we can modify our own created PR (status 2)
    # Actually modify_pr logic says:
    # if role == "Procurement Officer" and current_status != 1: return "Error"
    # So officer can only modify AI suggestions.
    print("Testing modify_pr on an AI suggestion (if any exists)...")
    # Find a status 1 PR
    status_1_prs = get_pr_ticket(OFFICER_ID, status=1)
    if not status_1_prs:
        # Create one manually for testing if needed, or just report
        print("No status 1 PRs found for modification.")
    else:
        target_pr = status_1_prs[0]['pr_id']
        print(modify_pr(OFFICER_ID, target_pr, {"Oil Filter": 20}, "Modified AI suggestion"))

    print("\n--- 6. Get PR Ticket ---")
    print("Search by user_id:")
    print(get_pr_ticket(OFFICER_ID))
    
    print("\nSearch by PR ID:")
    print(get_pr_ticket(OFFICER_ID, pr_id=new_pr_id))
    
    print("\nSearch by status:")
    print(get_pr_ticket(OFFICER_ID, status=2))

    print("\n--- 7. Get PR Details ---")
    print(get_pr_details(OFFICER_ID, new_pr_id))

if __name__ == "__main__":
    run_tests()