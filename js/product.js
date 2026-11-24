/* =========================================================
   product.js — страница product.html.
   Показывает товар по адресу product.html?id=3.
   Если id не указан — показывается первый товар.
   ========================================================= */

const productDetails = document.querySelector('[data-product-details]');
const productMissing = document.querySelector('[data-product-missing]');

function getRequestedProduct() {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('id');

  if (rawId === null) {
    return products[0];
  }

  const id = Number(rawId);
  return Number.isInteger(id) ? findProductById(id) : undefined;
}

function createSpecRow(name, value) {
  const row = createElement('tr');

  row.append(
    createElement('th', { text: name, attrs: { scope: 'row' } }),
    createElement('td', { text: value })
  );

  return row;
}

function renderProductDetails(product) {
  const title = productDetails.querySelector('[data-product-title]');
  const crumb = document.querySelector('[data-product-crumb]');
  const image = productDetails.querySelector('[data-product-image]');
  const price = productDetails.querySelector('[data-product-price]');
  const description = productDetails.querySelector('[data-product-description]');
  const specs = productDetails.querySelector('[data-product-specs]');

  document.title = `${product.title} — Магазин Жучков`;
  title.textContent = product.title;
  crumb.textContent = product.title;

  image.src = product.image;
  image.alt = product.title;

  price.textContent = '';
  price.append(createElement('span', {
    className: 'price-current',
    text: `Цена: ${formatPrice(getDiscountedPrice(product))}`
  }));

  if (product.discountPercent > 0) {
    price.append(createElement('s', { className: 'price-old', text: formatPrice(product.price) }));
  }

  description.textContent = product.description;

  specs.replaceChildren(
    createSpecRow('Категория', getCategoryTitle(product.category)),
    createSpecRow('Наличие', product.isAvailable ? 'В наличии' : 'Нет в наличии'),
    createSpecRow('Скидка', product.discountPercent > 0 ? `${product.discountPercent}%` : 'нет'),
    createSpecRow('Гарантия', '14 дней')
  );
}

function initProductPage() {
  const product = getRequestedProduct();

  if (!product) {
    productDetails.hidden = true;
    productMissing.hidden = false;
    document.title = 'Товар не найден — Магазин Жучков';
    return;
  }

  renderProductDetails(product);

  const addButton = productDetails.querySelector('[data-action="add-to-cart"]');
  const favoriteButton = productDetails.querySelector('[data-action="toggle-favorite"]');
  const quickOrderButton = productDetails.querySelector('button[data-product]');

  addButton.dataset.productId = String(product.id);
  favoriteButton.dataset.productId = String(product.id);
  quickOrderButton.dataset.product = product.title;

  if (product.isAvailable) {
    updateAddToCartButton(addButton, product.id);
  } else {
    addButton.disabled = true;
    addButton.textContent = 'Нет в наличии';
  }

  updateFavoriteButton(favoriteButton, product.id);

  productDetails.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');

    if (!button) {
      return;
    }

    if (button.dataset.action === 'add-to-cart') {
      handleAddToCartClick(product.id, button);
    }

    if (button.dataset.action === 'toggle-favorite') {
      handleFavoriteClick(product.id, button);
    }
  });

  document.addEventListener('cart:changed', () => {
    if (product.isAvailable) {
      updateAddToCartButton(addButton, product.id);
    }
  });

  document.addEventListener('favorites:changed', () => {
    updateFavoriteButton(favoriteButton, product.id);
  });
}

if (productDetails && productMissing) {
  initProductPage();
}
