import pandas as pd
import datetime
from .sharedlib.db_helper.db_ops import DBHelper, get_now
from .sharedlib.rbac_helper.role_permissions_check import RBACGatekeeper

db = DBHelper()
gatekeeper = RBACGatekeeper()

def validate_pr_status(pr_id):
    """Checks if PR exists and status is 'Approved' (ID: 4)."""
    pr_df = db.extract("purchase_request", conditions={"pr_id": pr_id})
    if pr_df.empty:
        return False
    
    # Check if status_id is 4 (Approved)
    return int(pr_df.iloc[0]['status_id']) == 4

def generate_next_po_id():
    """Generates next PO ID in PO_YYYYMM_XXXXX format."""
    po_df = db.extract("purchase_order")
    now = datetime.now()
    prefix = f"PO_{now.strftime('%Y%m')}_"
    
    if po_df.empty:
        return f"{prefix}00001"
    
    # Filter POs from the current month to find the max sequence
    current_month_pos = po_df[po_df['po_id'].str.contains(prefix)]
    if current_month_pos.empty:
        return f"{prefix}00001"
    
    # Extract numeric part, increment, and re-pad
    last_id = current_month_pos['po_id'].sort_values().iloc[-1]
    last_num = int(last_id.split('_')[-1])
    next_num = last_num + 1
    return f"{prefix}{next_num:05d}"

def create_po(pr_id, proc_item, user_id):
    """
    Converts a PR into one or more POs based on the proc_item structure.
    proc_item example: [{"ITM_001": 10, "ITM_002": 5}, {"ITM_003": 2}]
    """
    # 1. Validate PR status
    if not validate_pr_status(pr_id):
        print(f"Validation failed for {pr_id}. PR must be 'Approved'.")
        return False

    # Load item master once to lookup supplier_ids quickly
    item_master = db.extract("item", fields=["item_id", "supplier_id"])

    # 2. Process each PO in the list
    for po_items_dict in proc_item:
        new_po_id = generate_next_po_id()
        
        # Get supplier_id from the first item in this PO group
        first_item_id = list(po_items_dict.keys())[0]
        supplier_row = item_master[item_master['item_id'] == first_item_id]
        if supplier_row.empty:
            continue
        supplier_id = supplier_row.iloc[0]['supplier_id']

        # A. Create PO Header
        new_po_header = pd.DataFrame([{
            "po_id": new_po_id,
            "status": 5, # Awaiting Supplier Acceptance
            "supplier_id": supplier_id,
            "created_at": get_now(),
            "created_by": user_id
        }])
        db.load("purchase_order", new_po_header, mode='append')

        # B. Create Bridge Records
        bridge_entries = []
        for item_id, qty in po_items_dict.items():
            bridge_entries.append({
                "doc_id": new_po_id,
                "item_id": item_id,
                "quantity": qty
            })
        
        bridge_df = pd.DataFrame(bridge_entries)
        db.load("purchase_item_bridge", bridge_df, mode='append')

    # 3. Clean up PR items from bridge table
    # We use our delete helper to remove the PR records since they are now POs
    db.delete("purchase_item_bridge", conditions={"doc_id": pr_id})
    
    # Optionally: Update PR status to 'Converted' or similar if you add that status
    print(f"Success: {pr_id} converted into {len(proc_item)} Purchase Orders.")
    return True

def get_po_ticket(supplier_id):
    """
    Retrieves all purchase orders associated with a specific supplier.
    Includes the status name for clarity.
    """

    if not gatekeeper.is_authorized(supplier_id, "update_po_status"):
        return ("Error: Access Denied. You do not have permission to view PO tickets.")
    
    # 1. Extract POs for this supplier
    po_df = db.extract("purchase_order", conditions={"supplier_id": supplier_id})
    
    if po_df.empty:
        return []

    # 2. Join with dim_status to get human-readable status
    status_df = db.extract("dim_status")
    merged_df = po_df.merge(status_df, left_on="status", right_on="status_id", how="left")
    
    # 3. Clean up columns and return as list of dicts
    result = merged_df[['po_id', 'status', 'status_name', 'created_at']]
    return result.to_dict(orient='records')

def get_po_details(supplier_id, po_id):
    """
    Retrieves full details for a specific PO, including the items involved.
    """
    if not gatekeeper.is_authorized(supplier_id, "get_po_details"):
        return ("Error: Access Denied. You do not have permission to view PO details.")

    # 1. Get the PO header information
    po_header = db.extract("purchase_order", conditions={"po_id": po_id})
    if po_header.empty:
        return None

    # 2. Get the items from the bridge table
    bridge_df = db.extract("purchase_item_bridge", conditions={"doc_id": po_id})
    
    # 3. Join with item master to get names and prices
    item_master = db.extract("item", fields=["item_id", "item_name", "unit_price"])
    details_df = bridge_df.merge(item_master, on="item_id", how="left")
    
    # 4. Combine header and items into a single detailed object
    po_details = po_header.iloc[0].to_dict()
    po_details['items'] = details_df[['item_id', 'item_name', 'quantity', 'unit_price']].to_dict(orient='records')
    
    return po_details

def update_po_status(supplier_id, po_id, status_name):
    """
    Updates the status of a PO based on the status name (e.g., 'Order Shipped').
    """
    if not gatekeeper.is_authorized(supplier_id, "update_po_status"):
        return ("Error: Access Denied. You do not have permission to update PO status.")
    
    # 1. Resolve status_name to status_id
    status_df = db.extract("dim_status", conditions={"status": status_name})
    if status_df.empty:
        return f"Error: Status '{status_name}' is not valid."
    
    new_status_id = status_df.iloc[0]['status_id']
    
    # 2. Verify PO exists
    po_check = db.extract("purchase_order", conditions={"po_id": po_id})
    if po_check.empty:
        return "Error: Purchase Order not found."
    
    # 3. Update the database
    db.modify("purchase_order", {"status": int(new_status_id)}, {"po_id": po_id})
    return True