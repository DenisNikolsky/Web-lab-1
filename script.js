const products = [
  { id: 1, title: "Кружка", price: 500 },
  { id: 2, title: "Термос", price: 1500 },
  { id: 3, title: "Плед", price: 2000 },
  { id: 4, title: "Лампа", price: 1200 },
  { id: 5, title: "Рюкзак", price: 3000 },
  { id: 6, title: "Наушники", price: 2500 },
];

const STORAGE_KEY = "shop-cart";

const productsContainer = document.getElementById("products");
const cartList = document.getElementById("cart-list");
const cartEmpty = document.getElementById("cart-empty");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const orderModal = document.getElementById("order-modal");
const orderForm = document.getElementById("order-form");
const closeModalBtn = document.getElementById("close-modal");

let cart = loadCart();

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function renderProducts() {
  productsContainer.innerHTML = products
    .map(
      (product) => `
      <article class="product-card">
        <h3>${product.title}</h3>
        <p class="price">${formatPrice(product.price)}</p>
        <button class="btn btn-primary" type="button" data-add="${product.id}">
          Добавить в корзину
        </button>
      </article>
    `
    )
    .join("");
}

function renderCart() {
  if (cart.length === 0) {
    cartList.innerHTML = "";
    cartEmpty.hidden = false;
    cartTotal.textContent = formatPrice(0);
    return;
  }

  cartEmpty.hidden = true;

  cartList.innerHTML = cart
    .map(
      (item) => `
      <li class="cart-item">
        <div class="cart-item__title">${item.title}</div>
        <div class="cart-item__row">
          <div class="quantity-controls">
            <button class="btn" type="button" data-decrease="${item.id}">−</button>
            <input
              type="number"
              min="1"
              step="1"
              value="${item.quantity}"
              data-quantity="${item.id}"
              aria-label="Количество ${item.title}"
            >
            <button class="btn" type="button" data-increase="${item.id}">+</button>
          </div>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
          <button class="btn btn-danger" type="button" data-remove="${item.id}">
            Удалить
          </button>
        </div>
      </li>
    `
    )
    .join("");

  updateTotal();
}

function updateTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatPrice(total);
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
    });
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
}

function changeQuantity(productId, delta) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  renderCart();
}

function setQuantity(productId, value) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity < 1) {
    item.quantity = 1;
  } else {
    item.quantity = quantity;
  }

  saveCart();
  renderCart();
}

productsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  addToCart(Number(button.dataset.add));
});

cartList.addEventListener("click", (event) => {
  const decrease = event.target.closest("[data-decrease]");
  const increase = event.target.closest("[data-increase]");
  const remove = event.target.closest("[data-remove]");

  if (decrease) changeQuantity(Number(decrease.dataset.decrease), -1);
  if (increase) changeQuantity(Number(increase.dataset.increase), 1);
  if (remove) removeFromCart(Number(remove.dataset.remove));
});

cartList.addEventListener("change", (event) => {
  const input = event.target.closest("[data-quantity]");
  if (!input) return;
  setQuantity(Number(input.dataset.quantity), input.value);
});

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Корзина пуста");
    return;
  }
  orderModal.showModal();
});

closeModalBtn.addEventListener("click", () => {
  orderModal.close();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  alert("Заказ создан!");

  orderForm.reset();
  orderModal.close();

  cart = [];
  saveCart();
  renderCart();
});

renderProducts();
renderCart();