from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

app = Flask(__name__)
CORS(app)

products = []
next_id = 1


@app.route('/')
def home():
    return "Server running"


# 📄 GET all products
@app.route('/products', methods=['GET'])
def get_products():
    return jsonify(products)


# ➕ ADD product
@app.route('/products', methods=['POST'])
def add_product():
    global next_id

    data = request.get_json()

    if not data or not data.get("name") or not data.get("price") or not data.get("quantity"):
        return jsonify({"error": "Invalid data"}), 400

    product = {
        "id": next_id,
        "name": data["name"],
        "price": float(data["price"]),
        "quantity": int(data["quantity"])
    }

    products.append(product)
    next_id += 1

    return jsonify(product), 201


# ❌ DELETE
@app.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    global products
    products = [p for p in products if p["id"] != id]
    return jsonify({"message": "Deleted"})


# ✏️ UPDATE
@app.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    data = request.get_json()

    for p in products:
        if p["id"] == id:
            p["name"] = data.get("name", p["name"])
            p["price"] = float(data.get("price", p["price"]))
            p["quantity"] = int(data.get("quantity", p["quantity"]))
            return jsonify(p)

    return jsonify({"error": "Not found"}), 404


# 🔍 GET single product
@app.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    for p in products:
        if p["id"] == id:
            return jsonify(p)

    return jsonify({"error": "Not found"}), 404


# 🛒 BILLING (reduce stock)
@app.route('/bill', methods=['POST'])
def bill():
    data = request.get_json()

    pid = data["id"]
    qty = int(data["qty"])

    for p in products:
        if p["id"] == pid:
            if p["quantity"] >= qty:
                p["quantity"] -= qty
                total = p["price"] * qty
                return jsonify({"total": total})
            else:
                return jsonify({"error": "Not enough stock"})

    return jsonify({"error": "Product not found"})


# 🧾 INVOICE (PDF download)
@app.route('/invoice', methods=['POST'])
def generate_invoice():
    data = request.get_json()
    total = data.get("total", 0)

    file_name = "invoice.pdf"

    doc = SimpleDocTemplate(file_name)
    styles = getSampleStyleSheet()

    content = [
        Paragraph("Grocery Store Invoice", styles["Title"]),
        Paragraph("-----------------------------", styles["Normal"]),
        Paragraph(f"Total Amount: ₹{total}", styles["Normal"]),
        Paragraph("Thank you for your purchase!", styles["Normal"])
    ]

    doc.build(content)

    return send_file(file_name, as_attachment=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)