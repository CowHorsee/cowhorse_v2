from jinja2 import Environment, FileSystemLoader
import os

def render_preview():
    template_dir = os.path.dirname(os.path.abspath(__file__))
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('pdf_template.html')

    # Test PR (Purchase Request)
    pr_data = {
        "doc_type": "PR",
        "doc_id": "PR-2026-X772",
        "date": "2026-03-08",
        "created_at": "2026-03-08 18:45:12",
        "officer_name": "Sarah Jenkins",
        "officer_email": "s.jenkins@cowhorse.procurement.ai",
        "justification": "Urgent stock replenishment for upcoming regional supply demand. Predicted spike in Faber Hood appliance interest.",
        "items": [
            {"name": "Faber Hood Slim line 900", "quantity": 10, "unit_price": 1250.00},
            {"name": "Elba Built-in Hob 3B", "quantity": 5, "unit_price": 890.00}
        ]
    }
    
    html_pr = template.render(pr_data)
    with open("preview_pr.html", "w", encoding="utf-8") as f:
        f.write(html_pr)

    # Test PO (Purchase Order)
    po_data = {
        "doc_type": "PO",
        "doc_id": "PO-2026-SUP102",
        "date": "2026-03-09",
        "created_at": "2026-03-08 20:00:00",
        "last_modified": "2026-03-09 10:15:33",
        "officer_name": "Sarah Jenkins",
        "officer_email": "s.jenkins@cowhorse.procurement.ai",
        "manager_name": "Robert Chen",
        "manager_email": "r.chen@cowhorse.mgmt.ai",
        "supplier_name": "Appliance Direct Distributors",
        "supplier_contact": "John Doe (+60 3-1234 5678)",
        "supplier_email": "sales@appliancedirect.com.my",
        "justification": "Delivery requested before Friday 12th March. Please contact officer upon arrival.",
        "items": [
            {"name": "Faber Hood Slim line 900", "quantity": 10, "unit_price": 1250.00},
            {"name": "Elba Built-in Hob 3B", "quantity": 5, "unit_price": 890.00},
            {"name": "Samsung Microwave 23L", "quantity": 2, "unit_price": 450.00}
        ]
    }
    
    html_po = template.render(po_data)
    with open("preview_po.html", "w", encoding="utf-8") as f:
        f.write(html_po)

if __name__ == "__main__":
    render_preview()
    print("Previews generated successfully (preview_pr.html, preview_po.html)")
