import sys
import os
import asyncio
from datetime import datetime

# Add the correct paths to sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
api_dir = os.path.dirname(script_dir)
sys.path.append(api_dir)

from sharedlib.pdf_helper.pdf import generate_pdf

async def test_pdf_generation():
    # Generate a timestamp for dynamic filenames
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # 1. Test PR (Purchase Request)
    pr_data = {
        "doc_type": "PR",
        "doc_id": "PR-2026-X772",
        "date": "2026-03-08",
        "created_at": "2026-03-08 18:45:12",
        "officer_name": "Sarah Jenkins",
        "officer_email": "s.jenkins@cowhorse.procurement.ai",
        "items": [
            {"name": "Faber Hood Slim line 900", "quantity": 10, "unit_price": 1250.00},
            {"name": "Elba Built-in Hob 3B", "quantity": 5, "unit_price": 890.00}
        ]
    }
    
    print(f"Generating PR PDF via Playwright (suffix: {timestamp})...")
    output_dir = os.path.join(script_dir, "test_pdf_output")
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    pr_output = os.path.join(output_dir, f"test_pr_{timestamp}.pdf")
    try:
        await generate_pdf(pr_data, output_path=pr_output)
        print(f"Generated PDF: {pr_output}")
    except Exception as e:
        print(f"PDF Generation failed: {e}")
        print(f"Check for HTML fallback at: {pr_output.replace('.pdf', '.html')}")

    # 2. Test PO (Purchase Order)
    po_data = {
        "doc_type": "PO",
        "doc_id": "PO-2026-SUP102",
        "date": "2026-03-09",
        "created_at": "2026-03-08 20:00:00",
        "officer_name": "Sarah Jenkins",
        "officer_email": "s.jenkins@cowhorse.procurement.ai",
        "manager_name": "Robert Chen",
        "manager_email": "r.chen@cowhorse.mgmt.ai",
        "supplier_contact": "John Doe (+60 3-1234 5678)",
        "supplier_email": "sales@appliancedirect.com.my",
        "items": [
            {"name": "Faber Hood Slim line 900", "quantity": 10, "unit_price": 1250.00},
            {"name": "Elba Built-in Hob 3B", "quantity": 5, "unit_price": 890.00},
            {"name": "Samsung Microwave 23L", "quantity": 2, "unit_price": 450.00}
        ]
    }
    
    print(f"Generating PO PDF via Playwright (suffix: {timestamp})...")
    po_output = os.path.join(output_dir, f"test_po_{timestamp}.pdf")
    try:
        await generate_pdf(po_data, output_path=po_output)
        print(f"Generated PDF: {po_output}")
    except Exception as e:
        print(f"PDF Generation failed: {e}")
        print(f"Check for HTML fallback at: {po_output.replace('.pdf', '.html')}")

if __name__ == "__main__":
    asyncio.run(test_pdf_generation())
