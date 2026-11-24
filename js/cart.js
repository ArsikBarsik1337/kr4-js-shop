/* =========================================================
   cart.js — состояние корзины, расчёты и промокод.
   Здесь нет разметки страницы (её строит cart-view.js).
   Корзина хранится как массив { id, quantity } и сохраняется
   в localStorage. После любого изменения посылается событие
   'cart:changed', на которое подписаны остальные файлы.
   ========================================================= */

let cartItems = loadCart();
let appliedPromoCode = loadPromoCode();

/* ---------- Загрузка и сохранение ---------- */

// Данные из localStorage проверяются: туда могли попасть чужие или
// повреждённые значения. Из хранилища берём только id и количество,
// а название и цену всегда берём из массива products.
function loadCart() {
  const storedItems = loadFromStorage(STORAGE_KEYS.cart, []);

  if (!Array.isArray(storedItems)) {
    return [];
  }

  return storedItems.reduce((result, item) => {
    const isValid = item
      && Number.isInteger(item.id)
      && Number.isInteger(item.quantity)
      && item.quantity > 0
      && findProductById(item.id);

    if (!isValid || result.some((existing) => existing.id === item.id)) {
      return result;
    }

    result.push({ id: item.id, quantity: Math.min(item.quantity, MAX_QUANTITY) });
    return result;
  }, []);
}

function loadPromoCode() {
  const storedCode = loadFromStorage(STORAGE_KEYS.promo, null);

  if (typeof storedCode === 'string' && Object.hasOwn(promoCodes, storedCode)) {
    return storedCode;
  }

  return null;
}

function notifyCartChanged(isExternal = false) {
  document.dispatchEvent(new CustomEvent('cart:changed', { detail: { isExternal } }));
}

function saveCart() {
  saveToStorage(STORAGE_KEYS.cart, cartItems);
  notifyCartChanged();
}

/* ---------- Действия с корзиной ---------- */

function getCartQuantity(productId) {
  const item = cartItems.find((cartItem) => cartItem.id === productId);
  return item ? item.quantity : 0;
}

function addToCart(productId) {
  const product = findProductById(productId);

  if (!product) {
    return { ok: false, message: 'Товар не найден.' };
  }

  if (!product.isAvailable) {
    return { ok: false, message: 'Этого товара нет в наличии.' };
  }

  const item = cartItems.find((cartItem) => cartItem.id === productId);

  if (item && item.quantity >= MAX_QUANTITY) {
    return { ok: false, message: `Можно добавить не более ${MAX_QUANTITY} шт. одного товара.` };
  }

  if (item) {
    item.quantity += 1;
  } else {
    cartItems.push({ id: productId, quantity: 1 });
  }

  saveCart();
  return { ok: true, message: `«${product.title}» добавлен в корзину.` };
}

function removeFromCart(productId) {
  cartItems = cartItems.filter((item) => item.id !== productId);
  saveCart();
}

// delta = +1 или -1. Если количество стало 0 — товар удаляется.
function changeQuantity(productId, delta) {
  const item = cartItems.find((cartItem) => cartItem.id === productId);

  if (!item) {
    return;
  }

  const newQuantity = item.quantity + delta;

  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQuantity > MAX_QUANTITY) {
    return;
  }

  item.quantity = newQuantity;
  saveCart();
}

// Очистка корзины сбрасывает и применённый промокод.
function clearCart() {
  cartItems = [];
  appliedPromoCode = null;
  removeFromStorage(STORAGE_KEYS.promo);
  saveCart();
}

/* ---------- Промокод ---------- */

function getAppliedPromo() {
  return appliedPromoCode ? promoCodes[appliedPromoCode] : null;
}

function calculatePromoDiscount(promo, amount) {
  if (!promo || (promo.minTotal && amount < promo.minTotal)) {
    return 0;
  }

  if (promo.type === 'percent') {
    return Math.round(amount * promo.value / 100);
  }

  return Math.min(promo.value, amount);
}

function applyPromoCode(rawCode) {
  const code = rawCode.trim().toUpperCase();

  if (code === '') {
    return { ok: false, message: 'Введите промокод.' };
  }

  if (!Object.hasOwn(promoCodes, code)) {
    return { ok: false, message: 'Такого промокода нет. Проверьте написание.' };
  }

  const totals = calculateTotals();

  if (totals.units === 0) {
    return { ok: false, message: 'Сначала добавьте товары в корзину.' };
  }

  const promo = promoCodes[code];

  if (promo.minTotal && totals.itemsTotal < promo.minTotal) {
    return {
      ok: false,
      message: `Промокод ${code} действует при сумме товаров от ${formatPrice(promo.minTotal)}`
    };
  }

  appliedPromoCode = code;
  saveToStorage(STORAGE_KEYS.promo, code);
  notifyCartChanged();

  return { ok: true, message: `Промокод ${code} применён: ${promo.description.toLowerCase()}.` };
}

function removePromoCode() {
  appliedPromoCode = null;
  removeFromStorage(STORAGE_KEYS.promo);
  notifyCartChanged();
}

/* ---------- Расчёты ---------- */

// Строки корзины: товар из каталога + количество + цены.
function getCartLines() {
  return cartItems.map((item) => {
    const product = findProductById(item.id);
    const unitPrice = getDiscountedPrice(product);

    return {
      product,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity
    };
  });
}

// Все суммы считаются через reduce.
function calculateTotals() {
  const lines = getCartLines();

  const units = lines.reduce((sum, line) => sum + line.quantity, 0);
  const oldTotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const itemsTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  const promo = getAppliedPromo();
  const promoDiscount = calculatePromoDiscount(promo, itemsTotal);

  return {
    units,
    oldTotal,
    productDiscount: oldTotal - itemsTotal,
    itemsTotal,
    promoCode: appliedPromoCode,
    promoDiscount,
    total: itemsTotal - promoDiscount
  };
}

/* ---------- Счётчик и кнопки ---------- */

function updateCartBadges() {
  const units = calculateTotals().units;

  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    badge.textContent = String(units);
    badge.title = `Товаров в корзине: ${units}`;
  });
}

// Кнопка «В корзину» показывает, сколько штук уже лежит в корзине.
function updateAddToCartButton(button, productId) {
  const quantity = getCartQuantity(productId);

  button.textContent = quantity > 0 ? `В корзине: ${quantity}` : 'В корзину';
}

// Общий обработчик клика «В корзину» для каталога и страницы товара.
function handleAddToCartClick(productId, button) {
  const result = addToCart(productId);
  showToast(result.message);

  if (button) {
    updateAddToCartButton(button, productId);
  }
}

document.addEventListener('cart:changed', updateCartBadges);

// Изменения из другой вкладки браузера.
window.addEventListener('storage', (event) => {
  if (event.key !== null && event.key !== STORAGE_KEYS.cart && event.key !== STORAGE_KEYS.promo) {
    return;
  }

  cartItems = loadCart();
  appliedPromoCode = loadPromoCode();
  notifyCartChanged(true);
});

updateCartBadges();
