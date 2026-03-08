import sys
import os

os.environ["TESTING"] = "true"

# Add the api directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scripts.user_management import login, forget_password, change_password
from scripts.purchase_request import create_pr, modify_pr, get_pr_ticket, get_pr_details

# Officer ID (Raju from user.csv)
OFFICER_ID = "dd4f18d8-3859-490f-88fd-330203e15be2"
OFFICER_EMAIL = "johndoe@company.com"

def run_tests():
    print("--- 1. Login Account ---")
    role, user_id, msg = login(OFFICER_EMAIL, "eda7074c")
    print(f"Login Result: {msg}, Role: {role}, User ID: {user_id}")

    print("\n--- 2. Change Password ---")
    # Change from 'password123' to 'newpassword456'
    print(change_password(OFFICER_ID, "eda7074c", "newpassword456"))

    # Verify by logging in with new password
    role, user_id, msg = login(OFFICER_EMAIL, "newpassword456")
    print(f"Login with NEW password: {msg}")

    print("\n--- 3. Forget Password ---")
    print(forget_password(OFFICER_ID))

    print("\n--- 4. Create PR ---")
    proc_item = {"Elba Built-in Gas Hob": 10, "Faber Chimney Hood": 5}
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