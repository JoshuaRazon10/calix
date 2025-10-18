const PRODUCTS = [
  { id: 1, title: "Air Runner 1", price: 6999, image: "images/runner.jpg" },
  { id: 2, title: "Zoom Speed 2", price: 5499, image: "images/zoom.jpg" },
  { id: 3, title: "Court Classic", price: 4599, image: "images/court.jpg" },
  { id: 4, title: "Trail Blazer", price: 6299, image: "images/blazer.jpg" },
  { id: 5, title: "Street Flex", price: 3999, image: "images/street.jpg" },
  { id: 6, title: "Elite Fly", price: 8499, image: "images/elite.jpg" },
];

const CART_KEY = "calix_nike_cart_v1";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}");

const productsGrid = document.getElementById("productsGrid");
const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const cartEmpty = document.getElementById("cartEmpty");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearBtn = document.getElementById("clearBtn");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");

function formatCurrency(n) {
  return "₱" + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function renderProducts(list) {
  if (!productsGrid) return;
  productsGrid.innerHTML = "";
  if (!list.length) {
    noResults.style.display = "block";
    return;
  } else noResults.style.display = "none";

  list.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product";
    card.innerHTML = `
      <div class="thumb"><img src="${p.image}" alt="${p.title}" /></div>
      <div class="p-title">${p.title}</div>
      <div class="meta">
        <div class="price">${formatCurrency(p.price)}</div>
        <div class="stock">Stock: 10</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button class="btn" data-add="${p.id}">Add to cart</button>
        <button class="outline" data-view="${p.id}">View</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id, qty = 1) {
  const p = PRODUCTS.find((x) => x.id === Number(id));
  if (!p) return;
  if (cart[id]) cart[id].qty += qty;
  else cart[id] = { ...p, qty };
  saveCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
}

function changeQty(id, qty) {
  if (qty <= 0) return removeFromCart(id);
  if (cart[id]) cart[id].qty = qty;
  saveCart();
}

function cartSummary() {
  const items = Object.values(cart);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return { items, total, count };
}

function updateCartUI() {
  if (!cartCountEl) return;
  const { items, total, count } = cartSummary();
  cartCountEl.textContent = count;
  cartTotalEl.textContent = formatCurrency(total);
  cartItemsEl.innerHTML = "";
  cartEmpty.style.display = items.length ? "none" : "block";

  items.forEach((it) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${it.image}" alt="${it.title}" />
      <div style="flex:1">
        <div style="font-weight:600">${it.title}</div>
        <div class="muted">${formatCurrency(it.price)} • Subtotal ${formatCurrency(it.price * it.qty)}</div>
      </div>
      <div class="qty">
        <button data-dec="${it.id}">-</button>
        <div>${it.qty}</div>
        <button data-inc="${it.id}">+</button>
      </div>
      <button class="outline" data-remove="${it.id}">Remove</button>
    `;
    cartItemsEl.appendChild(row);
  });
}

if (productsGrid) {
  renderProducts(PRODUCTS);
  updateCartUI();

  productsGrid.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    const view = e.target.closest("[data-view]");
    if (add) addToCart(add.dataset.add);
    if (view) alert(`Viewing ${PRODUCTS.find(p => p.id == view.dataset.view).title}`);
  });

  cartBtn.addEventListener("click", () => cartDrawer.classList.toggle("open"));

  cartItemsEl.addEventListener("click", (e) => {
    const dec = e.target.closest("[data-dec]");
    const inc = e.target.closest("[data-inc]");
    const rem = e.target.closest("[data-remove]");
    if (dec) changeQty(dec.dataset.dec, cart[dec.dataset.dec].qty - 1);
    if (inc) changeQty(inc.dataset.inc, cart[inc.dataset.inc].qty + 1);
    if (rem) removeFromCart(rem.dataset.remove);
  });

  checkoutBtn.addEventListener("click", () => {
    const { items, total } = cartSummary();
    if (!items.length) return alert("Your cart is empty");
    alert(`Checkout:\n${items.map(i => i.qty + '× ' + i.title).join('\\n')}\n\nTotal: ${formatCurrency(total)}\n\n(Demo only)`);
    cart = {};
    saveCart();
    cartDrawer.classList.remove("open");
  });

  clearBtn.addEventListener("click", () => {
    if (confirm("Clear cart?")) {
      cart = {};
      saveCart();
    }
  });

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = PRODUCTS.filter((p) => p.title.toLowerCase().includes(q));
    renderProducts(filtered);
  });
}
