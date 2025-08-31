// Datos de productos persistidos en localStorage
let products = JSON.parse(localStorage.getItem("products")) || [
  { id: 1, name: "Laptop", price: 1000, stock: 5 },
  { id: 2, name: "IPhone", price: 600, stock: 10 },
  { id: 3, name: "Audífonos", price: 100, stock: 15 }
];

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

// Carrito persistido en localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Órdenes persistidas en localStorage
let orders = JSON.parse(localStorage.getItem("orders")) || [];
function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// Renderizado de catálogo de productos
function renderCatalog(filterText = "") {
  const lista = document.getElementById("listaProductos");
  lista.innerHTML = "";
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filterText.toLowerCase())
  );
  if (filtered.length === 0) {
    lista.innerHTML = "<li class='muted'>No hay coincidencias</li>";
    return;
  }
  filtered.forEach(prod => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${prod.name}</strong> — $${prod.price} (stock: ${prod.stock})
      <button onclick="addToCart(${prod.id})" class="btn">Agregar</button>
    `;
    lista.appendChild(li);
  });
}

// Renderizado del carrito
function renderCart() {
  const cuerpo = document.getElementById("cuerpoCarrito");
  const tabla = document.getElementById("tablaCarrito");
  const vacio = document.getElementById("carritoVacio");
  const totalEl = document.getElementById("totalCarrito");

  cuerpo.innerHTML = "";
  if (cart.length === 0) {
    tabla.hidden = true;
    vacio.hidden = false;
    totalEl.textContent = "$0";
    return;
  }
  tabla.hidden = false;
  vacio.hidden = true;

  let total = 0;
  cart.forEach(item => {
    const tr = document.createElement("tr");
    const subtotal = item.price * item.quantity;
    total += subtotal;
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price}</td>
      <td>$${subtotal}</td>
      <td><button onclick="removeFromCart(${item.id})" class="btn rojo">X</button></td>
    `;
    cuerpo.appendChild(tr);
  });
  totalEl.textContent = "$" + total;
}

// Renderizado de órdenes
function renderOrders() {
  const lista = document.getElementById("listaOrdenes");
  lista.innerHTML = "";
  if (orders.length === 0) {
    lista.innerHTML = "<li class='muted'>No hay órdenes previas</li>";
    return;
  }
  orders.forEach((order, idx) => {
    const li = document.createElement("li");
    li.textContent = `Orden #${idx + 1}: ${order.items.length} productos — Total $${order.total}`;
    lista.appendChild(li);
  });
}

// Agregar producto al carrito
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.stock <= 0) {
    Swal.fire("Error", "Producto sin stock!", "error");
    return;
  }
  let item = cart.find(c => c.id === productId);
  if (item) {
    if (item.quantity < product.stock) {
      item.quantity++;
    } else {
      Swal.fire("Aviso", "No hay más stock disponible.", "warning");
    }
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  renderCart();
}

// Eliminar producto del carrito
function removeFromCart(productId) {
  const idx = cart.findIndex(c => c.id === productId);
  if (idx > -1) {
    cart[idx].quantity--;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    saveCart();
    renderCart();
  }
}

// Vaciar carrito
document.getElementById("btnVaciar").addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
});

// Finalizar compra
document.getElementById("btnComprar").addEventListener("click", () => {
  if (cart.length === 0) {
    Swal.fire("Aviso", "El carrito está vacío.", "info");
    return;
  }
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  orders.push({ items: [...cart], total });
  cart = [];
  saveOrders();
  saveCart();
  renderCart();
  renderOrders();
  Swal.fire("Éxito", "Compra realizada!", "success");
});

// Agregar producto al catálogo mediante formulario
document.getElementById("formProducto").addEventListener("submit", e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const precio = parseInt(document.getElementById("precioProducto").value);
  if (!nombre || precio <= 0) {
    Swal.fire("Error", "Datos inválidos", "error");
    return;
  }
  const nuevo = { id: Date.now(), name: nombre, price: precio, stock: 10 };
  products.push(nuevo);
  saveProducts();
  renderCatalog();
  e.target.reset();
  Swal.fire("Éxito", "Producto agregado al catálogo", "success");
});

// Filtrar catálogo
document.getElementById("filtro").addEventListener("input", e => {
  renderCatalog(e.target.value);
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  renderCart();
  renderOrders();
});
