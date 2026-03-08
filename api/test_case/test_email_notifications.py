import os
import sys
import logging

# Add api directory to sys.path for imports
api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if api_dir not in sys.path:
    sys.path.append(api_dir)

from sharedlib.email_helper.email import quick_send

# Configure logging
logging.basicConfig(level=logging.INFO)

def load_env():
    """Manual loader for local.settings.json and .env for hackathon environment."""
    # 1. Try local.settings.json (Azure standard)
    settings_path = os.path.join(api_dir, "local.settings.json")
    if os.path.exists(settings_path):
        import json
        try:
            with open(settings_path, 'r') as f:
                settings = json.load(f)
                values = settings.get("Values", {})
                for k, v in values.items():
                    os.environ[k] = str(v)
            logging.info("Loaded credentials from local.settings.json")
        except Exception as e:
            logging.error(f"Error loading local.settings.json: {e}")

    # 2. Try .env (Standard fallback)
    env_path = os.path.join(api_dir, ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r') as f:
                for line in f:
                    if line.strip() and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
            logging.info("Loaded credentials from .env")
        except Exception as e:
            logging.error(f"Error loading .env: {e}")

# Load environment before importing EmailHelper logic
load_env()

TARGET_EMAIL = "ashley@gmail.com"
DUMMY_PDF = os.path.join(api_dir, "test_case/test_pdf_output/test_pr_20260308_194010.pdf")

def test_all_emails():
    print(f"Starting email verification test for: {TARGET_EMAIL}")
    
    # 1. Account Creation
    print("Sending Account Creation Email...")
    quick_send(
        recipient_email=TARGET_EMAIL,
        subject="Welcome to Procurement Planning Intelligent System",
        template_name="email_templates.html",
        template_data={
            "template_type": "ACCOUNT_CREATED",
            "name": "Ashley",
            "email": TARGET_EMAIL,
            "role_name": "Procurement Manager",
            "temp_password": "HackathonUser2026!",
            "login_url": "http://localhost/3000"
        }
    )

    # 2. Forget Password
    print("Sending Forget Password Email...")
    quick_send(
        recipient_email=TARGET_EMAIL,
        subject="Password Reset Notification",
        template_name="email_templates.html",
        template_data={
            "template_type": "FORGET_PASSWORD",
            "user_id": "WT-8888",
            "temp_password": "ResetPassword123!",
            "login_url": "http://localhost/3000"
        }
    )

    # 3. Procurement Alert by AI
    print("Sending AI Procurement Alert...")
    quick_send(
        recipient_email=TARGET_EMAIL,
        subject="[AI ALERT] Low Stock Detected: Faber Chimney Hood",
        template_name="email_templates.html",
        template_data={
            "template_type": "PROCUREMENT_ALERT",
            "item_name": "Faber Chimney Hood",
            "predicted_demand": 45,
            "current_stock": 3,
            "justification": "Predictive analytics show a 300% surge in demand for urban kitchen appliances over the next 14 days.",
            "login_url": "http://localhost/3000"
        }
    )

    # 4. Create PR (with attachment)
    print("Sending PR Creation Email (with attachment)...")
    quick_send(
        recipient_email=TARGET_EMAIL,
        subject="New Purchase Request: PR_202603_00456",
        template_name="email_templates.html",
        template_data={
            "template_type": "PURCHASE_REQUEST",
            "doc_id": "PR_202603_00456",
            "officer_name": "System Admin",
            "item_count": 5,
            "justification": "Restocking core inventory for Q1 project phase.",
            "login_url": "http://localhost/3000"
        },
        attachments=[DUMMY_PDF]
    )

    # 5. Create PO (with attachment)
    print("Sending PO Creation Email (with attachment)...")
    quick_send(
        recipient_email=TARGET_EMAIL,
        subject="Purchase Order Issued: PO_202603_00789",
        template_name="email_templates.html",
        template_data={
            "template_type": "PURCHASE_ORDER",
            "doc_id": "PO_202603_00789",
            "date": "2026-03-08",
            "login_url": "http://localhost/3000"
        },
        attachments=[DUMMY_PDF]
    )

    print("\nAll test emails have been dispatched. Please check your inbox.")

if __name__ == "__main__":
    test_all_emails()
