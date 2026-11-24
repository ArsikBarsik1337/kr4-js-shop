/* =========================================================
   utils.js — общие вспомогательные функции.
   Здесь нет логики конкретных страниц: только то, что нужно
   в нескольких файлах (форматирование, создание элементов,
   сообщения). Благодаря этому код не дублируется.
   ========================================================= */

const MAX_QUANTITY = 10;

function formatPrice(value) {
  return `${Number(value).toLocaleString('ru-RU')} руб.`;
}

// Цена со скидкой. Скидка хранится в процентах в поле discountPercent.
function getDiscountedPrice(product) {
  return Math.round(product.price * (100 - product.discountPercent) / 100);
}

function findProductById(id) {
  return products.find((product) => product.id === id);
}

function getCategoryTitle(categoryId) {
  const category = categories.find((item) => item.id === categoryId);
  return category ? category.title : 'Без категории';
}

// Склонение: pluralize(2, ['товар', 'товара', 'товаров']) → «товара»
function pluralize(count, forms) {
  const lastTwo = Math.abs(count) % 100;
  const lastOne = lastTwo % 10;

  if (lastTwo > 10 && lastTwo < 20) {
    return forms[2];
  }

  if (lastOne > 1 && lastOne < 5) {
    return forms[1];
  }

  if (lastOne === 1) {
    return forms[0];
  }

  return forms[2];
}

// Бейджи карточки вычисляются по данным товара, отдельно их хранить не нужно.
function getProductBadges(product) {
  const badges = [];

  if (product.isNew) {
    badges.push({ text: 'Новинка', modifier: 'product-card__badge--new' });
  }

  if (product.discountPercent > 0) {
    badges.push({ text: `−${product.discountPercent}%`, modifier: '' });
  }

  return badges;
}

// Короткая обёртка над document.createElement.
// Весь текст попадает в элемент через textContent, поэтому
// разметка из данных не выполняется (защита от XSS).
function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  if (options.className) {
    element.classList.add(...options.className.split(' ').filter(Boolean));
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  if (options.attrs) {
    Object.entries(options.attrs).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }

  return element;
}

// Выводит сообщение в блок состояния (role="status").
// type: 'success' | 'error' | 'info'. Пустой блок скрывается в CSS (:empty).
function setMessage(element, text, type) {
  if (!element) {
    return;
  }

  element.classList.remove('is-success', 'is-error', 'is-info');
  element.textContent = text;

  if (text !== '' && type) {
    element.classList.add(`is-${type}`);
  }
}

// Всплывающее уведомление вместо диалога alert.
function showToast(message) {
  let region = document.querySelector('.toast-region');

  if (!region) {
    region = createElement('div', {
      className: 'toast-region',
      attrs: { role: 'status', 'aria-live': 'polite' }
    });
    document.body.append(region);
  }

  // Показываем только последнее уведомление, чтобы они не копились стопкой.
  const toast = createElement('p', { className: 'toast', text: message });
  region.replaceChildren(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}
