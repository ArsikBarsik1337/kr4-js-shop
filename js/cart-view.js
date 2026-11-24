/* =========================================================
   cart-view.js — отображение корзины.
   cart.html  — список товаров, количество, удаление, промокод;
   order.html — краткая сводка заказа рядом с формой.
   Расчёты берутся из cart.js, здесь только разметка.
   ========================================================= */

const cartList = document.querySelector('[data-cart-list]');
const cartContent = document.querySelector('[data-cart-content]');
const cartEmpty = document.querySelector('[data-cart-empty]');
const cartTotalsBox = document.querySelector('[data-cart-totals]');
const cartSummaryText = document.querySelector('[data-cart-summary-text]');
const cartTitle = document.querySelector('[data-cart-title]');
const promoForm = document.querySelector('[data-promo-form]');
const promoInput = document.querySelector('#promo-code');
const promoMessage = document.querySelector('[data-promo-message]');
const removePromoButton = document.querySelector('[data-action="remove-promo"]');
const orderSummary = document.querySelector('[data-order-summary]');

/* ---------- Общие части ---------- */

function createTotalsRow(label, value, modifier) {
  const row = createElement('div', { className: `cart-totals__row ${modifier || ''}` });

  row.append(
    createElement('dt', { text: label }),
    createElement('dd', { text: value })
  );

  return row;
}

// Блок «Итого»: используется и в корзине, и на странице оформления.
function createTotalsList(totals) {
  const list = createElement('dl', { className: 'cart-totals' });

  list.append(createTotalsRow('Товаров', `${totals.units} шт.`));

  if (totals.productDiscount > 0) {
    list.append(createTotalsRow('Сумма без скидок', formatPrice(totals.oldTotal)));
    list.append(createTotalsRow('Скидка на товары', `−${formatPrice(totals.productDiscount)}`, 'is-discount'));
  }

  if (totals.promoCode) {
    const promoText = totals.promoDiscount > 0
      ? `−${formatPrice(totals.promoDiscount)}`
      : 'не действует';

    list.append(createTotalsRow(
      `Промокод ${totals.promoCode}`,
      promoText,
      totals.promoDiscount > 0 ? 'is-discount' : 'is-muted'
    ));
  }

  list.append(createTotalsRow('Итого', formatPrice(totals.total), 'cart-totals__row--total'));

  return list;
}

function createPriceText(product, unitPrice) {
  const price = createElement('p', { className: 'cart-item__price' });

  price.append(createElement('span', { text: `${formatPrice(unitPrice)} за шт.` }));

  if (product.discountPercent > 0) {
    price.append(createElement('s', { className: 'price-old', text: formatPrice(product.price) }));
  }

  return price;
}

/* ---------- Страница корзины ---------- */

function createQuantityButton(action, text, label, line) {
  const button = createElement('button', {
    className: 'button button--secondary quantity__button',
    text,
    attrs: {
      type: 'button',
      'aria-label': `${label}: ${line.product.title}`,
      'data-action': action,
      'data-product-id': String(line.product.id)
    }
  });

  if (action === 'increase' && line.quantity >= MAX_QUANTITY) {
    button.disabled = true;
  }

  return button;
}

function createCartItem(line) {
  const { product } = line;
  const productUrl = `product.html?id=${product.id}`;
  const item = createElement('li', {
    className: 'cart-item',
    attrs: { 'data-product-id': String(product.id) }
  });

  const imageLink = createElement('a', { attrs: { href: productUrl, tabindex: '-1', 'aria-hidden': 'true' } });
  const image = createElement('img', {
    className: 'cart-item__image',
    attrs: { alt: '', width: '160', height: '120', loading: 'lazy' }
  });
  image.src = product.image;
  imageLink.append(image);

  const info = createElement('div', { className: 'cart-item__info' });
  const title = createElement('h3', { className: 'cart-item__title' });
  title.append(createElement('a', { text: product.title, attrs: { href: productUrl } }));
  info.append(title, createPriceText(product, line.unitPrice));

  const controls = createElement('div', { className: 'cart-item__controls' });
  const quantity = createElement('div', {
    className: 'quantity',
    attrs: { role: 'group', 'aria-label': `Количество: ${product.title}` }
  });
  quantity.append(
    createQuantityButton('decrease', '−', 'Уменьшить количество', line),
    createElement('span', { className: 'quantity__value', text: String(line.quantity) }),
    createQuantityButton('increase', '+', 'Увеличить количество', line)
  );

  const total = createElement('p', { className: 'cart-item__total', text: formatPrice(line.lineTotal) });
  const removeButton = createElement('button', {
    className: 'button button--secondary cart-item__remove',
    text: 'Удалить',
    attrs: {
      type: 'button',
      'aria-label': `Удалить из корзины: ${product.title}`,
      'data-action': 'remove',
      'data-product-id': String(product.id)
    }
  });

  controls.append(quantity, total, removeButton);
  item.append(imageLink, info, controls);

  return item;
}

function renderCartPage() {
  const lines = getCartLines();
  const totals = calculateTotals();
  const hasItems = lines.length > 0;

  // Пустое состояние: вместо списка показываем подсказку со ссылкой на каталог.
  cartContent.hidden = !hasItems;
  cartEmpty.hidden = hasItems;

  cartList.replaceChildren(...lines.map(createCartItem));
  cartTotalsBox.replaceChildren(createTotalsList(totals));

  cartSummaryText.textContent = hasItems
    ? `В корзине ${totals.units} ${pluralize(totals.units, ['товар', 'товара', 'товаров'])}.`
    : 'В корзине пока ничего нет.';

  removePromoButton.hidden = !totals.promoCode;

  if (totals.promoCode) {
    promoInput.value = totals.promoCode;
  }
}

// После перерисовки возвращаем фокус на ту же кнопку, чтобы клавиатурой
// можно было нажимать «+» несколько раз подряд.
function restoreFocus(action, productId) {
  const selector = `[data-action="${action}"][data-product-id="${productId}"]`;
  const button = cartList.querySelector(selector);

  if (button && !button.disabled) {
    button.focus();
  } else {
    cartTitle.focus();
  }
}

function handleCartListClick(event) {
  const button = event.target.closest('[data-action]');

  if (!button) {
    return;
  }

  const productId = Number(button.dataset.productId);
  const action = button.dataset.action;

  if (action === 'increase') {
    changeQuantity(productId, 1);
  } else if (action === 'decrease') {
    changeQuantity(productId, -1);
  } else if (action === 'remove') {
    const product = findProductById(productId);
    removeFromCart(productId);
    showToast(`«${product.title}» удалён из корзины.`);
    cartTitle.focus();
    return;
  } else {
    return;
  }

  restoreFocus(action, productId);
}

function handlePromoSubmit(event) {
  event.preventDefault();

  const result = applyPromoCode(promoInput.value);

  setMessage(promoMessage, result.message, result.ok ? 'success' : 'error');

  if (result.ok) {
    promoInput.removeAttribute('aria-invalid');
  } else {
    promoInput.setAttribute('aria-invalid', 'true');
    promoInput.focus();
  }
}

function initCartPage() {
  cartList.addEventListener('click', handleCartListClick);
  promoForm.addEventListener('submit', handlePromoSubmit);

  removePromoButton.addEventListener('click', () => {
    removePromoCode();
    promoInput.value = '';
    promoInput.removeAttribute('aria-invalid');
    setMessage(promoMessage, 'Промокод удалён.', 'info');
    promoInput.focus();
  });

  document.querySelector('[data-action="clear-cart"]').addEventListener('click', () => {
    clearCart();
    promoInput.value = '';
    setMessage(promoMessage, '', '');
    showToast('Корзина очищена.');
    cartTitle.focus();
  });

  document.addEventListener('cart:changed', renderCartPage);
  renderCartPage();
}

/* ---------- Сводка на странице оформления ---------- */

function renderOrderSummary() {
  const lines = getCartLines();
  const totals = calculateTotals();
  const nodes = [];

  if (lines.length === 0) {
    nodes.push(
      createElement('p', {
        className: 'order-summary__empty',
        text: 'Корзина пуста. Заявку можно отправить и без товаров.'
      }),
      createElement('a', {
        className: 'button button--secondary',
        text: 'Перейти в каталог',
        attrs: { href: 'catalog.html' }
      })
    );
  } else {
    const list = createElement('ul', { className: 'order-summary__list' });

    lines.forEach((line) => {
      list.append(createElement('li', {
        text: `${line.product.title} × ${line.quantity} — ${formatPrice(line.lineTotal)}`
      }));
    });

    nodes.push(
      list,
      createTotalsList(totals),
      createElement('a', {
        className: 'button button--secondary',
        text: 'Изменить корзину',
        attrs: { href: 'cart.html' }
      })
    );
  }

  orderSummary.querySelector('[data-order-summary-body]').replaceChildren(...nodes);
}

function initOrderSummary() {
  document.addEventListener('cart:changed', renderOrderSummary);
  renderOrderSummary();
}

if (cartList && cartContent && cartEmpty && cartTotalsBox && promoForm && promoInput
  && promoMessage && removePromoButton && cartSummaryText && cartTitle) {
  initCartPage();
}

if (orderSummary) {
  initOrderSummary();
}
