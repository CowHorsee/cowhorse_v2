import os
import pandas as pd
import shutil

def reset_test_data():
    base_path = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_path, "testing_dataset")
    
    print(f"Resetting test data in: {dataset_path}")
    
    # Define initial state for user.csv (Only Admin Ahmad)
    # Ahmad's hash is for 'password123'
    import bcrypt
    ahmad_pw = "password123"
    ahmad_hash = bcrypt.hashpw(ahmad_pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    initial_users = [
        ["111e4567-e89b-12d3-a456-426614174000", "Ahmad", "ahmad@fiamma.com.my", bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'), "", 1, "2026-03-07T00:00:00.000000"]
    ]
    user_df = pd.DataFrame(initial_users, columns=["user_id","name","email","password_hash","raw_password","role_id","created_at"])
    user_df.to_csv(os.path.join(dataset_path, "user.csv"), index=False)
    
    # Clear other tables and establish types using dummy values
    pr_cols = ["pr_id", "status_id", "created_at", "created_by", "last_modified_at", "last_modified_by", "reviewed_at", "reviewed_by", "justification"]
    # We add a dummy row with strings in potentially nullable or type-sensitive columns
    dummy_pr = pd.DataFrame([["DUMMY", 0, "TS", "USER", "TS", "USER", "TS", "USER", "JUST"]], columns=pr_cols)
    dummy_pr.to_csv(os.path.join(dataset_path, "purchase_request.csv"), index=False)
    
    po_cols = ["po_id", "status", "supplier_id", "created_at", "created_by"]
    dummy_po = pd.DataFrame([["DUMMY", 0, "SUP", "TS", "USER"]], columns=po_cols)
    dummy_po.to_csv(os.path.join(dataset_path, "purchase_order.csv"), index=False)
    
    bridge_cols = ["doc_id", "item_id", "quantity"]
    pd.DataFrame(columns=bridge_cols).to_csv(os.path.join(dataset_path, "purchase_item_bridge.csv"), index=False)
    
    print("Test data reset successfully.")

if __name__ == "__main__":
    reset_test_data()
