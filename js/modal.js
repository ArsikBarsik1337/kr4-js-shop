/* =========================================================
   main.js — общий скрипт для всех страниц проекта.
   Работает безопасно: если элемента нет на странице —
   код просто не выполняется, ошибок в консоли не будет.
   ========================================================= */

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------
     1. Модальное окно заявки на главной странице
     ------------------------------------------------------- */
  const orderDialog = document.getElementById('order-dialog');
  const orderButtons = document.querySelectorAll('button[data-product]');
  const closeDialogButton = document.getElementById('close-order-dialog');
  const selectedProductInput = document.getElementById('selected-product');
  const orderForm = document.getElementById('order-form');
  const successMessage = document.getElementById('success-message');

  if (orderDialog && orderButtons.length > 0) {
    // Открытие модалки по кнопке «Заказать»
    orderButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const productName = button.dataset.product || '';
        if (selectedProductInput) {
          selectedProductInput.value = productName;
        }
        orderDialog.showModal();
      });
    });

    // Закрытие по кнопке «Закрыть»
    if (closeDialogButton) {
      closeDialogButton.addEventListener('click', () => {
        orderDialog.close();
      });
    }

    // Закрытие по клику на backdrop (вне области dialog)
    orderDialog.addEventListener('click', (event) => {
  if (event.target !== orderDialog) return;
  const r = orderDialog.getBoundingClientRect();
  const inside = event.clientX >= r.left && event.clientX <= r.right &&
                 event.clientY >= r.top && event.clientY <= r.bottom;
  if (!inside) orderDialog.close();
});
  }

  /* -------------------------------------------------------
     2. Общая функция обработки формы с валидацией.
     Возвращает true, если форма успешно «отправлена».
     ------------------------------------------------------- */
function setFieldError(field, message) {
  const id = `${field.id}-error`;
  let error = document.getElementById(id);

  if (!message) {
    if (error) error.remove();
    field.removeAttribute('aria-describedby');
    return;
  }
  if (!error) {
    error = document.createElement('small');
    error.id = id;
    error.className = 'field-error';
    field.insertAdjacentElement('afterend', error);
  }
  error.textContent = message;
  field.setAttribute('aria-describedby', id);
}

function handleFormSubmit(form, onSuccess) {
  if (!form) return;

  form.addEventListener('input', (event) => {
    const field = event.target;
    if (field.willValidate && field.checkValidity()) {
      field.removeAttribute('aria-invalid');
      setFieldError(field, '');
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = Array.from(form.elements).filter((el) => el.willValidate);
    fields.forEach((el) => {
      el.removeAttribute('aria-invalid');
      setFieldError(el, '');
    });

    const invalid = fields.filter((el) => !el.checkValidity());
    if (invalid.length > 0) {
      invalid.forEach((el) => {
        el.setAttribute('aria-invalid', 'true');
        setFieldError(el, el.validationMessage);
      });
      invalid[0].focus();
      return;
    }

    if (typeof onSuccess === 'function') onSuccess();
  });
}

  /* -------------------------------------------------------
     3. Форма в модальном окне (index.html)
     ------------------------------------------------------- */
  if (orderForm) {
    handleFormSubmit(orderForm, () => {
      if (successMessage) {
        successMessage.hidden = false;
        // Прячем сообщение через 4 секунды
        setTimeout(() => {
          successMessage.hidden = true;
        }, 4000);
      }
      orderForm.reset();
      if (orderDialog) {
        orderDialog.close();
      }
    });
  }

  /* -------------------------------------------------------
     4. Форма на странице order.html
     ------------------------------------------------------- */
  const orderPageForm = document.getElementById('order-page-form');
  const orderPageSuccess = document.getElementById('order-page-success');

  if (orderPageForm) {
    handleFormSubmit(orderPageForm, () => {
      if (orderPageSuccess) {
        orderPageSuccess.hidden = false;
        orderPageSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          orderPageSuccess.hidden = true;
        }, 4000);
      }
      orderPageForm.reset();
    });
  }

  const contactForm = document.getElementById('contact-form');
  const contactSuccess = document.getElementById('contact-success');

  if (contactForm) {
    handleFormSubmit(contactForm, () => {
      if (contactSuccess) {
        contactSuccess.hidden = false;
        setTimeout(() => { contactSuccess.hidden = true; }, 4000);
      }
      contactForm.reset();
    });
  }

  /* -------------------------------------------------------
     5. Плавный скролл для кнопки «Наверх»
     ------------------------------------------------------- */
  const buttonUp = document.querySelector('.button-up');
  if (buttonUp) {
    buttonUp.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    const setNavOpen = (open) => {
      siteNav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };

    navToggle.addEventListener('click', () => {
      setNavOpen(!siteNav.classList.contains('is-open'));
    });

    siteNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setNavOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
        setNavOpen(false);
        navToggle.focus();
      }
    });
  }

  const mapWrapper = document.querySelector('.map-wrapper');

  if (mapWrapper) {
    const setMapTitle = () => {
      const frame = mapWrapper.querySelector('iframe');
      if (frame && !frame.title) frame.title = 'Карта: расположение магазина';
      return Boolean(frame);
    };

    if (!setMapTitle()) {
      const observer = new MutationObserver(() => {
        if (setMapTitle()) observer.disconnect();
      });
      observer.observe(mapWrapper, { childList: true });
    }
  }
});