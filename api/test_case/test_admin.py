import sys
import os

os.environ["TESTING"] = "true"

# Add the project root to sys.path to allow imports from api
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from api.scripts.user_management import register, search_user, modify_role
from reset_test_data import reset_test_data

# Admin ID from user.csv (Ahmad)
ADMIN_ID = "111e4567-e89b-12d3-a456-426614174000"

def run_tests():
    print("--- 0. Reset Test Data ---")
    reset_test_data()

    print("\n--- 1. Register Users ---")
    print(register(ADMIN_ID, "wallace@company.com", "Wallace", "Procurement Manager", password="c860c329", user_id="194b1bd8-e13c-461a-8afb-04da92440a8b"))
    print(register(ADMIN_ID, "johndoe@company.com", "John Doe", "Procurement Manager", password="eda7074c", user_id="dd4f18d8-3859-490f-88fd-330203e15be2"))
    print(register(ADMIN_ID, "john@fiamma.com.my", "John", "Supplier", password="80290066", user_id="888e4567-e89b-12d3-a456-426614174001"))
    print(register(ADMIN_ID, "wei@fiamma.com.my", "Wei", "Warehouse Personnel", password="2b3049bf", user_id="444e4567-e89b-12d3-a456-426614174000"))

    print("\n--- 2. Search User ---")
    print("Search by name (Wallace):")
    print(search_user(name="Wallace"))
    
    print("\nSearch by role (Procurement Manager):")
    print(search_user(role_name="Procurement Manager"))
    
    print("\nSearch by email (raju@fiamma.com.my):")
    print(search_user(email="raju@fiamma.com.my"))

    print("\n--- 3. Modify Role ---")
    # Get John Doe's ID
    john_doe = search_user(email="johndoe@company.com")
    if john_doe:
        john_id = john_doe[0]['user_id']
        print(f"Modifying John Doe (ID: {john_id}) to Procurement Officer")
        print(modify_role(ADMIN_ID, john_id, "Procurement Officer"))
    else:
        print("John Doe not found for modification.")

    print("\n--- 4. Search User (Verify John Doe) ---")
    print(search_user(name="John Doe"))

if __name__ == "__main__":
    run_tests()