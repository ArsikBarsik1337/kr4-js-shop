/* =========================================================
   catalog.js — страница catalog.html.
   Поиск, фильтры, сортировка, пагинация и вывод карточек.
   Все карточки создаются через createElement, текст —
   только через textContent.
   ========================================================= */

const PAGE_SIZE = 6;

const productsContainer = document.querySelector('[data-products-container]');
const catalogForm = document.querySelector('#catalog-form');
const searchInput = document.querySelector('#catalog-search');
const categoryFilter = document.querySelector('#category-filter');
const sortSelect = document.querySelector('#sort-select');
const minPriceInput = document.querySelector('#price-min');
const maxPriceInput = document.querySelector('#price-max');
const onlyAvailableCheckbox = document.querySelector('#only-available');
const onlyFavoritesCheckbox = document.querySelector('#only-favorites');
const priceError = document.querySelector('#price-error');
const catalogCount = document.querySelector('.catalog-count');
const catalogEmpty = document.querySelector('.catalog-empty');
const catalogTitle = document.querySelector('#catalog-results-title');
const paginationNav = document.querySelector('[data-pagination]');

// Состояние каталога: всё, что выбрал пользователь.
const catalogState = {
  query: '',
  category: 'all',
  sort: 'default',
  minPrice: null,
  maxPrice: null,
  onlyAvailable: false,
  onlyFavorites: false,
  page: 1
};

/* ---------- Обработка данных (чистые функции) ---------- */

function searchProducts(productList, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === '') {
    return productList;
  }

  return productList.filter((product) => {
    return product.title.toLowerCase().includes(normalizedQuery);
  });
}

function filterProductsByCategory(productList, category) {
  if (category === 'all') {
    return productList;
  }

  return productList.filter((product) => product.category === category);
}

// Фильтр по цене с учётом скидки: сравниваем ту цену, которую видит покупатель.
function filterProductsByPrice(productList, minPrice, maxPrice) {
  return productList.filter((product) => {
    const price = getDiscountedPrice(product);
    const isAboveMin = minPrice === null || price >= minPrice;
    const isBelowMax = maxPrice === null || price <= maxPrice;

    return isAboveMin && isBelowMax;
  });
}

function sortProducts(productList, sortType) {
  const productsCopy = [...productList];

  switch (sortType) {
    case 'price-asc':
      return productsCopy.sort((a, b) => getDiscountedPrice(a) - getDiscountedPrice(b));
    case 'price-desc':
      return productsCopy.sort((a, b) => getDiscountedPrice(b) - getDiscountedPrice(a));
    case 'title-asc':
      return productsCopy.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    case 'title-desc':
      return productsCopy.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
    default:
      return productsCopy;
  }
}

// Применяет к массиву все условия из состояния по очереди.
function getPreparedProducts(productList, state) {
  let result = [...productList];

  result = searchProducts(result, state.query);
  result = filterProductsByCategory(result, state.category);
  result = filterProductsByPrice(result, state.minPrice, state.maxPrice);

  if (state.onlyAvailable) {
    result = result.filter((product) => product.isAvailable);
  }

  if (state.onlyFavorites) {
    result = result.filter((product) => isFavorite(product.id));
  }

  return sortProducts(result, state.sort);
}

// Пагинация: берём из массива только товары текущей страницы.
function paginateProducts(productList, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(productList.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: productList.slice(start, start + pageSize),
    page: currentPage,
    totalPages
  };
}

/* ---------- Создание карточки ---------- */

function createFavoriteButton(product) {
  const button = createElement('button', {
    className: 'favorite-button',
    attrs: {
      type: 'button',
      'aria-label': `Избранное: ${product.title}`,
      'data-action': 'toggle-favorite',
      'data-product-id': String(product.id),
      'data-label-on': '♥',
      'data-label-off': '♡'
    }
  });

  updateFavoriteButton(button, product.id);
  return button;
}

function createPriceBlock(product) {
  const price = createElement('p', { className: 'product-card__price' });

  price.append(createElement('span', {
    className: 'price-current',
    text: formatPrice(getDiscountedPrice(product))
  }));

  if (product.discountPercent > 0) {
    price.append(createElement('s', {
      className: 'price-old',
      text: formatPrice(product.price)
    }));
  }

  return price;
}

function createProductCard(product) {
  const card = createElement('article', {
    className: 'product-card',
    attrs: { 'data-product-id': String(product.id) }
  });

  if (product.discountPercent > 0) {
    card.classList.add('product-card--discount');
  }

  if (!product.isAvailable) {
    card.classList.add('product-card--unavailable');
  }

  const productUrl = `product.html?id=${product.id}`;

  const badges = createElement('div', { className: 'product-card__badges' });
  getProductBadges(product).forEach((badge) => {
    badges.append(createElement('span', {
      className: `product-card__badge ${badge.modifier}`,
      text: badge.text
    }));
  });

  const imageLink = createElement('a', {
    className: 'product-card__image-link',
    attrs: { href: productUrl, tabindex: '-1', 'aria-hidden': 'true' }
  });
  const image = createElement('img', {
    className: 'product-card__image',
    attrs: { alt: '', width: '640', height: '480', loading: 'lazy' }
  });
  image.src = product.image;
  imageLink.append(image);

  const title = createElement('h3', { className: 'product-card__title' });
  const titleLink = createElement('a', { text: product.title, attrs: { href: productUrl } });
  title.append(titleLink);

  const description = createElement('p', {
    className: 'product-card__description',
    text: product.description
  });

  const meta = createElement('p', {
    className: 'product-card__meta',
    text: getCategoryTitle(product.category)
  });

  const status = createElement('p', {
    className: `product-card__status ${product.isAvailable ? 'is-available' : 'is-unavailable'}`,
    text: product.isAvailable ? 'В наличии' : 'Нет в наличии'
  });

  const button = createElement('button', {
    className: 'button product-card__button',
    attrs: {
      type: 'button',
      'aria-label': `Добавить в корзину: ${product.title}`,
      'data-action': 'add-to-cart',
      'data-product-id': String(product.id)
    }
  });

  if (product.isAvailable) {
    updateAddToCartButton(button, product.id);
  } else {
    button.disabled = true;
    button.textContent = 'Недоступно';
  }

  card.append(
    badges,
    createFavoriteButton(product),
    imageLink,
    title,
    description,
    meta,
    createPriceBlock(product),
    status,
    button
  );

  return card;
}

/* ---------- Вывод на страницу ---------- */

function renderProducts(productsToRender) {
  productsContainer.replaceChildren(...productsToRender.map(createProductCard));
}

function renderCount(totalFound, pageData) {
  const word = pluralize(totalFound, ['товар', 'товара', 'товаров']);
  let text = `Найдено: ${totalFound} ${word}`;

  if (pageData.totalPages > 1) {
    text += ` · страница ${pageData.page} из ${pageData.totalPages}`;
  }

  catalogCount.textContent = text;
}

function createPageItem(text, targetPage, options) {
  const item = createElement('li');
  const button = createElement('button', {
    className: options.isCurrent ? 'button button--primary' : 'button button--secondary',
    text,
    attrs: {
      type: 'button',
      'data-page': String(targetPage),
      'aria-label': options.label
    }
  });

  if (options.isCurrent) {
    button.setAttribute('aria-current', 'page');
  }

  button.disabled = Boolean(options.isDisabled);
  item.append(button);

  return item;
}

function renderPagination(pageData) {
  paginationNav.textContent = '';
  paginationNav.hidden = pageData.totalPages <= 1;

  if (pageData.totalPages <= 1) {
    return;
  }

  const list = createElement('ul', { className: 'pagination__list' });

  list.append(createPageItem('‹', pageData.page - 1, {
    label: 'Предыдущая страница',
    isDisabled: pageData.page === 1
  }));

  for (let page = 1; page <= pageData.totalPages; page += 1) {
    list.append(createPageItem(String(page), page, {
      label: `Страница ${page}`,
      isCurrent: page === pageData.page
    }));
  }

  list.append(createPageItem('›', pageData.page + 1, {
    label: 'Следующая страница',
    isDisabled: pageData.page === pageData.totalPages
  }));

  paginationNav.append(list);
}

function updateCatalog() {
  const preparedProducts = getPreparedProducts(products, catalogState);
  const pageData = paginateProducts(preparedProducts, catalogState.page, PAGE_SIZE);

  catalogState.page = pageData.page;

  renderProducts(pageData.items);
  renderCount(preparedProducts.length, pageData);
  renderPagination(pageData);

  // Пустое состояние: товаров по условиям нет.
  catalogEmpty.hidden = preparedProducts.length > 0;

  if (preparedProducts.length === 0) {
    const isFavoritesEmpty = catalogState.onlyFavorites && getFavoritesCount() === 0;

    catalogEmpty.querySelector('p').textContent = isFavoritesEmpty
      ? 'В избранном пока ничего нет. Нажмите ♡ на карточке товара, чтобы добавить его сюда.'
      : 'По выбранным условиям товары не найдены. Измените запрос или сбросьте фильтры.';
  }
}

/* ---------- Чтение элементов управления ---------- */

function parsePriceValue(value) {
  if (value.trim() === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function readPriceFilter() {
  const minPrice = parsePriceValue(minPriceInput.value);
  const maxPrice = parsePriceValue(maxPriceInput.value);
  const isRangeWrong = minPrice !== null && maxPrice !== null && minPrice > maxPrice;

  // Если диапазон задан неверно, показываем ошибку и не применяем цену.
  priceError.textContent = isRangeWrong
    ? 'Минимальная цена не может быть больше максимальной.'
    : '';
  priceError.hidden = !isRangeWrong;

  [minPriceInput, maxPriceInput].forEach((input) => {
    if (isRangeWrong) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  });

  catalogState.minPrice = isRangeWrong ? null : minPrice;
  catalogState.maxPrice = isRangeWrong ? null : maxPrice;
}

function readControls() {
  catalogState.query = searchInput.value;
  catalogState.category = categoryFilter.value;
  catalogState.sort = sortSelect.value;
  catalogState.onlyAvailable = onlyAvailableCheckbox.checked;
  catalogState.onlyFavorites = onlyFavoritesCheckbox.checked;
  readPriceFilter();
}

// Любое изменение фильтров возвращает на первую страницу.
function handleControlsChange() {
  readControls();
  catalogState.page = 1;
  updateCatalog();
}

/* ---------- События ---------- */

function initCatalog() {
  // Ссылка «Избранное» в меню ведёт на catalog.html?favorites=1
  const params = new URLSearchParams(window.location.search);
  onlyFavoritesCheckbox.checked = params.get('favorites') === '1';

  catalogForm.addEventListener('input', handleControlsChange);
  catalogForm.addEventListener('change', handleControlsChange);
  catalogForm.addEventListener('submit', (event) => event.preventDefault());

  // reset срабатывает до того, как поля вернутся к значениям по умолчанию.
  catalogForm.addEventListener('reset', () => {
    setTimeout(handleControlsChange, 0);
  });

  document.querySelectorAll('[data-action="reset-filters"]').forEach((button) => {
    button.addEventListener('click', () => catalogForm.reset());
  });

  productsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');

    if (!button) {
      return;
    }

    const productId = Number(button.dataset.productId);

    if (button.dataset.action === 'add-to-cart') {
      handleAddToCartClick(productId, button);
    }

    if (button.dataset.action === 'toggle-favorite') {
      handleFavoriteClick(productId, button);
    }
  });

  paginationNav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');

    if (!button || button.disabled) {
      return;
    }

    catalogState.page = Number(button.dataset.page);
    updateCatalog();

    // Кнопка, на которую нажали, исчезла при перерисовке — переносим фокус.
    catalogTitle.focus();
  });

  // Количество в корзине могло измениться (в том числе в другой вкладке).
  document.addEventListener('cart:changed', () => {
    productsContainer.querySelectorAll('[data-action="add-to-cart"]:not(:disabled)').forEach((button) => {
      updateAddToCartButton(button, Number(button.dataset.productId));
    });
  });

  document.addEventListener('favorites:changed', (event) => {
    if (event.detail.isExternal || catalogState.onlyFavorites) {
      updateCatalog();
    }
  });

  // Возврат на страницу кнопкой «Назад»: заново читаем поля фильтров.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      handleControlsChange();
    }
  });

  handleControlsChange();
}

if (productsContainer && catalogForm && paginationNav) {
  initCatalog();
} else {
  console.warn('catalog.js: на странице нет элементов каталога.');
}
