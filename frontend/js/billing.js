const API_URL = "http://127.0.0.1:5000";

let cart = [];
let total = 0;

// Load products
function loadProducts() {
  fetch(`${API_URL}/products`)
    .then(res => res.json())
    .then(data => {
      let options = "";
      data.forEach(p => {
        options += `<option value="${p.id}">${p.name} (₹${p.price})</option>`;
      });
      document.getElementById("productSelect").innerHTML = options;
    });
}

// Add to cart
function addToCart() {
  const id = document.getElementById("productSelect").value;
  const qtyInput = document.getElementById("qty");
  const qty = qtyInput.value;

  if (!qty || qty <= 0) {
    alert("Enter valid quantity");
    return;
  }

  fetch(`${API_URL}/products/${id}`)
    .then(res => res.json())
    .then(p => {
      const existing = cart.find(item => item.id == p.id);

      if (existing) {
        existing.qty += Number(qty);
        existing.total = existing.price * existing.qty;
      } else {
        cart.push({
          id: p.id,
          name: p.name,
          price: p.price,
          qty: Number(qty),
          total: p.price * qty
        });
      }

      displayCart();

      // 🔥 IMPORTANT CHANGE (THIS FIXES YOUR ISSUE)
      qtyInput.value = "";
      qtyInput.disabled = true;   // no more editing after selection
    });
}

// Display cart
function displayCart() {
  let html = "";
  total = 0;

  cart.forEach((i, index) => {
    total += i.total;

    html += `
    <tr>
      <td>${i.name}</td>
      <td>₹${i.price}</td>
      <td>${i.qty}</td>
      <td>₹${i.total}</td>
      <td>
        <button onclick="removeItem(${index})" style="background:red;">Remove</button>
      </td>
    </tr>`;
  });

  document.getElementById("cartTable").innerHTML = html;
  document.getElementById("total").innerText = "Total: ₹" + total;
}

// Remove item
function removeItem(index) {
  cart.splice(index, 1);
  displayCart();
}

// Checkout
function checkout() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  cart.forEach(i => {
    fetch(`${API_URL}/bill`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        id: parseInt(i.id),
        qty: parseInt(i.qty)
      })
    });
  });

  alert("Purchase successful!");

  cart = [];
  displayCart();

  // 🔥 enable quantity input again for next use
  document.getElementById("qty").disabled = false;
}

// Invoice preview
function showInvoice() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  let html = "<h3>Items:</h3><ul>";

  cart.forEach(i => {
    html += `<li>${i.name} - ₹${i.price} × ${i.qty} = ₹${i.total}</li>`;
  });

  html += "</ul>";
  html += `<h3>Total: ₹${total}</h3>`;

  document.getElementById("invoiceContent").innerHTML = html;
  document.getElementById("invoiceModal").style.display = "block";
}

// Close invoice
function closeInvoice() {
  document.getElementById("invoiceModal").style.display = "none";
}

// Download invoice
function downloadInvoice() {
  fetch(`${API_URL}/invoice`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ total: total })
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoice.pdf";
      a.click();
    });
}

window.onload = loadProducts;