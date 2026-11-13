const productsContainer = document.querySelector('[data-products-container]');
const searchInput = document.querySelector('#catalog-search');
const categoryFilter = document.querySelector('#category-filter');
const sortSelect = document.querySelector('#sort-select');
const catalogCount = document.querySelector('.catalog-count');
const catalogEmpty = document.querySelector('.catalog-empty');

if (!productsContainer) {
  console.warn('Контейнер товаров не найден. Проверьте data-products-container.');
}

const catalogState = {
  query: '',
  category: 'all',
  sort: 'default'
};

function searchProducts(products, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === '') {
    return products;
  }

  return products.filter((product) => {
    return product.title.toLowerCase().includes(normalizedQuery);
  });
}

function filterProductsByCategory(products, category) {
  if (category === 'all') {
    return products;
  }

  return products.filter((product) => {
    return product.category === category;
  });
}

function sortProducts(products, sortType) {
  const productsCopy = [...products];

  if (sortType === 'price-asc') {
    return productsCopy.sort((a, b) => a.price - b.price);
  }

  if (sortType === 'price-desc') {
    return productsCopy.sort((a, b) => b.price - a.price);
  }

  if (sortType === 'title-asc') {
    return productsCopy.sort((a, b) => a.title.localeCompare(b.title));
  }

  return productsCopy;
}

function getPreparedProducts(products, state) {
  let result = [...products];

  result = searchProducts(result, state.query);
  result = filterProductsByCategory(result, state.category);
  result = sortProducts(result, state.sort);

  return result;
}

function formatPrice(price) {
  return `${price.toLocaleString('ru-RU')} руб.`;
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.classList.add('product-card');

  const image = document.createElement('img');
  image.classList.add('product-card__image');
  image.src = product.image;
  image.alt = product.title;

  const title = document.createElement('h3');
  title.classList.add('product-card__title');
  title.textContent = product.title;

  const description = document.createElement('p');
  description.classList.add('product-card__description');
  description.textContent = product.description;

  const price = document.createElement('p');
  price.classList.add('product-card__price');
  price.textContent = formatPrice(product.price);

  const status = document.createElement('p');
  status.classList.add('product-card__status');
  status.textContent = product.isAvailable ? 'В наличии' : 'Нет в наличии';

  const button = document.createElement('button');
  button.classList.add('product-card__button');
  button.type = 'button';
  button.textContent = 'В корзину';
  button.dataset.action = 'add-to-cart';
  button.dataset.productId = String(product.id);

  if (!product.isAvailable) {
    button.disabled = true;
    button.textContent = 'Недоступно';
  }

  card.append(image, title, description, price, status, button);

  return card;
}

Добавьте функцию:
function renderProducts(productsToRender) {
  productsContainer.textContent = '';

  if (catalogCount) {
    catalogCount.textContent = `Найдено товаров: ${productsToRender.length}`;
  }

  if (catalogEmpty) {
    catalogEmpty.hidden = productsToRender.length > 0;
  }

  productsToRender.forEach((product) => {
    const card = createProductCard(product);
    productsContainer.append(card);
  });
}

function updateCatalog() {
  const preparedProducts = getPreparedProducts(products, catalogState);
  renderProducts(preparedProducts);
}

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    catalogState.query = event.target.value;
    updateCatalog();
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', (event) => {
    catalogState.category = event.target.value;
    updateCatalog();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', (event) => {
    catalogState.sort = event.target.value;
    updateCatalog();
  });
}

if (productsContainer) {
  updateCatalog();
}

if (productsContainer) {
  productsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="add-to-cart"]');

    if (!button) {
      return;
    }

    const productId = Number(button.dataset.productId);
    const selectedProduct = products.find((product) => product.id === productId);

    if (!selectedProduct) {
      console.warn('Товар не найден:', productId);
      return;
    }

    console.log(`Товар добавлен в корзину: ${selectedProduct.title}`);
  });

  cartItems.push(selectedProduct);
updateCartCounter();

}

const cartCounter = document.querySelector('.cart-counter');
const cartItems = [];

function updateCartCounter() {
  if (cartCounter) {
    cartCounter.textContent = `В корзине: ${cartItems.length}`;
  }
}
