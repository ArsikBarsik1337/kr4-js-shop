/* =========================================================
   favorites.js — избранные товары.
   Хранится массив id в localStorage. После изменения
   посылается событие 'favorites:changed'.
   ========================================================= */

let favoriteIds = loadFavorites();

function loadFavorites() {
  const storedIds = loadFromStorage(STORAGE_KEYS.favorites, []);

  if (!Array.isArray(storedIds)) {
    return [];
  }

  return storedIds.filter((id, index) => {
    return Number.isInteger(id) && findProductById(id) && storedIds.indexOf(id) === index;
  });
}

function notifyFavoritesChanged(isExternal = false) {
  document.dispatchEvent(new CustomEvent('favorites:changed', { detail: { isExternal } }));
}

function getFavoritesCount() {
  return favoriteIds.length;
}

function isFavorite(productId) {
  return favoriteIds.includes(productId);
}

// Добавляет или убирает товар. Возвращает true, если товар теперь в избранном.
function toggleFavorite(productId) {
  if (!findProductById(productId)) {
    return false;
  }

  if (isFavorite(productId)) {
    favoriteIds = favoriteIds.filter((id) => id !== productId);
  } else {
    favoriteIds.push(productId);
  }

  saveToStorage(STORAGE_KEYS.favorites, favoriteIds);
  notifyFavoritesChanged();

  return isFavorite(productId);
}

function updateFavoriteBadges() {
  document.querySelectorAll('[data-favorites-count]').forEach((badge) => {
    badge.textContent = String(favoriteIds.length);
    badge.title = `В избранном: ${favoriteIds.length}`;
  });
}

// Кнопка избранного: состояние показывает aria-pressed,
// подписи лежат в data-атрибутах кнопки.
function updateFavoriteButton(button, productId) {
  const active = isFavorite(productId);

  button.setAttribute('aria-pressed', String(active));
  button.textContent = active ? button.dataset.labelOn : button.dataset.labelOff;
}

function handleFavoriteClick(productId, button) {
  const product = findProductById(productId);
  const active = toggleFavorite(productId);

  showToast(active
    ? `«${product.title}» добавлен в избранное.`
    : `«${product.title}» убран из избранного.`);

  if (button) {
    updateFavoriteButton(button, productId);
  }
}

document.addEventListener('favorites:changed', updateFavoriteBadges);

window.addEventListener('storage', (event) => {
  if (event.key !== null && event.key !== STORAGE_KEYS.favorites) {
    return;
  }

  favoriteIds = loadFavorites();
  notifyFavoritesChanged(true);
});

updateFavoriteBadges();
