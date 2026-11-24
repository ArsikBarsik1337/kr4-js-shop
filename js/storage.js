/* =========================================================
   storage.js — безопасная работа с localStorage.
   Подключается в <head> без defer (вместе с boot.js).
   ========================================================= */

const STORAGE_KEYS = {
  theme: 'kr4-theme',
  cart: 'kr4-cart',
  promo: 'kr4-promo',
  favorites: 'kr4-favorites'
};

// Читает значение из localStorage. Если данных нет или они повреждены —
// возвращает запасное значение. Данные из хранилища считаем недоверенными:
// после чтения их всё равно проверяют (см. cart.js и favorites.js).
function loadFromStorage(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key);

    if (rawValue === null) {
      return fallback;
    }

    return JSON.parse(rawValue);
  } catch (error) {
    return fallback;
  }
}

// Сохраняет значение. Возвращает false, если хранилище недоступно
// (приватный режим, переполнение, запрет в настройках браузера).
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // хранилище недоступно — удалять нечего
  }
}
