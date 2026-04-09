const API_URL = "http://127.0.0.1:5000";

// 🔄 Load all products
function loadProducts() {
  fetch(`${API_URL}/products`)
    .then(res => res.json())
    .then(data => {
      let html = "";

      data.forEach(p => {
        html += `
        <tr>
          <td>${p.name}</td>
          <td>₹${p.price}</td>
          <td>${p.quantity}</td>
          <td>
            <button onclick="editProduct(${p.id}, \`${p.name}\`, ${p.price}, ${p.quantity})">Edit</button>
            <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
          </td>
        </tr>`;
      });

      document.getElementById("product-list").innerHTML = html;
    })
    .catch(err => console.error("Load error:", err));
}

// ➕ Add product
function addProduct() {
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value;
  const quantity = document.getElementById("quantity").value;

  if (!name || !price || !quantity) {
    alert("Please fill all fields");
    return;
  }

  fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      name: name,
      price: Number(price),
      quantity: Number(quantity)
    })
  })
    .then(res => res.json())
    .then(() => {
      clearInputs();
      loadProducts();
    })
    .catch(err => console.error("Add error:", err));
}

// ❌ Delete product
function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  fetch(`${API_URL}/products/${id}`, {
    method: "DELETE"
  })
    .then(() => loadProducts())
    .catch(err => console.error("Delete error:", err));
}

// ✏️ Edit product
function editProduct(id, oldName, oldPrice, oldQuantity) {
  const name = prompt("Enter new name:", oldName);
  const price = prompt("Enter new price:", oldPrice);
  const quantity = prompt("Enter new quantity:", oldQuantity);

  if (!name || !price || !quantity) {
    alert("Invalid input");
    return;
  }

  fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      name: name,
      price: Number(price),
      quantity: Number(quantity)
    })
  })
    .then(() => loadProducts())
    .catch(err => console.error("Update error:", err));
}

// 🧹 Clear inputs
function clearInputs() {
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("quantity").value = "";
}

// 🚀 Run when page loads
window.onload = loadProducts;