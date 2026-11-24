/* =========================================================
   main.js — общая инициализация, подключается на всех страницах
   последним. Содержит то, что нужно каждой странице:
   меню, кнопку «Наверх» и название карты.
   Каждая функция сама проверяет, есть ли нужные элементы
   на странице, поэтому ошибок в консоли нет.
   ========================================================= */

/* ---------- Навигация ---------- */

function initThemeToggle() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  applyTheme();
  button.addEventListener('click', () => {
    themePreference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveToStorage(STORAGE_KEYS.theme, themePreference);
  });
  systemTheme.addEventListener('change', applyTheme);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.theme || event.key === null) {
      themePreference = readThemePreference();
      applyTheme();
    }
  });
}

function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('#site-nav');

  if (!navToggle || !siteNav) {
    return;
  }

  function setNavOpen(isOpen) {
    siteNav.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  }

  navToggle.addEventListener('click', () => {
    setNavOpen(!siteNav.classList.contains('is-open'));
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setNavOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
      setNavOpen(false);
      navToggle.focus();
    }
  });
}

/* ---------- Кнопка «Наверх» ---------- */

function initScrollTopButton() {
  const buttonUp = document.querySelector('.button-up');

  if (!buttonUp) {
    return;
  }

  buttonUp.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Карта на странице контактов ---------- */

// Карта подключается внешним скриптом позже, поэтому ждём появления iframe.
function initMapTitle() {
  const mapWrapper = document.querySelector('.map-wrapper');

  if (!mapWrapper) {
    return;
  }

  function setMapTitle() {
    const frame = mapWrapper.querySelector('iframe');

    if (frame && !frame.title) {
      frame.title = 'Карта: расположение магазина';
    }

    return Boolean(frame);
  }

  if (!setMapTitle()) {
    const observer = new MutationObserver(() => {
      if (setMapTitle()) {
        observer.disconnect();
      }
    });

    observer.observe(mapWrapper, { childList: true });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavigation();
  initScrollTopButton();
  initMapTitle();
});
