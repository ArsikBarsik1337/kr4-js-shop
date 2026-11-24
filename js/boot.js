/* =========================================================
   boot.js — ранняя инициализация (подключается в <head> без defer).
   Ставит класс js на <html>: CSS понимает, что скрипты работают.
   ========================================================= */

document.documentElement.classList.add('js');

const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function readThemePreference() {
  const value = loadFromStorage(STORAGE_KEYS.theme, null);
  return value === 'light' || value === 'dark' ? value : null;
}

let themePreference = readThemePreference();

function applyTheme() {
  const theme = themePreference || (systemTheme.matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  const button = document.querySelector('[data-theme-toggle]');
  if (button) {
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

applyTheme();
