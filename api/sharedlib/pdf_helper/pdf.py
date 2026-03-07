from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
import io

def generate_pdf(data):
    # 1. Setup Jinja2 to load templates
    env = Environment(loader=FileSystemLoader('templates'))
    template = env.get_template('template.html')

    # 2. Render HTML with your dynamic data
    html_out = template.render(data)

    # 3. Convert HTML to PDF (in-memory)
    pdf_file = io.BytesIO()
    HTML(string=html_out).write_pdf(pdf_file)
    
    return pdf_file.getvalue()

# Example Data Object
po_data = {
    "po_id": "PO_202603_001",
    "supplier_name": "TechLogistics MY",
    "date": "2026-03-07",
    "items": [
        {"name": "Elba Gas Hob", "quantity": 20, "unit_price": 850.00},
        {"name": "Faber Hood", "quantity": 10, "unit_price": 1200.00}
    ]
}