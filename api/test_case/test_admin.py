import sys
import os

os.environ["TESTING"] = "true"

# Add the project root to sys.path to allow imports from api
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from api.scripts.user_management import register, search_user, modify_role

# Admin ID from user.csv (Ahmad)
ADMIN_ID = "111e4567-e89b-12d3-a456-426614174000"

def run_tests():
    print("--- 1. Register Users ---")
    print(register(ADMIN_ID, "wallace@company.com", "Wallace", "Procurement Manager"))
    print(register(ADMIN_ID, "johndoe@company.com", "John Doe", "Procurement Manager"))
    print(register(ADMIN_ID, "supplier_test@company.com", "Supplier Test", "Supplier"))
    print(register(ADMIN_ID, "warehouse_test@company.com", "Warehouse Test", "Warehouse Personnel"))

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