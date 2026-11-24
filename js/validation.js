/* =========================================================
   validation.js — проверка и «отправка» форм.
   Работает со всеми формами, у которых есть атрибут
   data-validate: заявка (index, product), заказ (order),
   обратная связь (contacts).

   Состояния формы:
   1. обычное;
   2. есть ошибки — под полями тексты ошибок, сверху сводка;
   3. отправка — кнопка заблокирована, текст «Отправляем…»;
   4. успех — сообщение на странице, форма очищена.
   Диалоги alert не используются. Данные никуда не отправляются:
   отправка имитируется через setTimeout.
   ========================================================= */

const SUBMIT_DELAY_MS = 1200;
const DIALOG_CLOSE_DELAY_MS = 1800;

/* ---------- Правила проверки ---------- */

function validateName(value) {
  if (value.length < 2) {
    return 'Имя должно содержать не менее 2 символов.';
  }

  if (!/^[A-Za-zА-Яа-яЁё\s'’-]+$/.test(value)) {
    return 'Имя может содержать только буквы, пробел и дефис.';
  }

  return '';
}

function validateEmail(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value) ? '' : 'Введите корректный e-mail, например name@mail.ru.';
}

function validatePhone(value) {
  const digits = value.replace(/\D/g, '');
  const hasOnlyAllowedChars = /^[\d\s()+-]+$/.test(value);
  const isRussianNumber = digits.length === 11 && ['7', '8'].includes(digits[0]);

  return hasOnlyAllowedChars && isRussianNumber
    ? ''
    : 'Введите телефон в формате +7 (900) 000-00-00.';
}

function validateAddress(value) {
  return value.length >= 5 ? '' : 'Укажите адрес доставки (не менее 5 символов).';
}

function validateMessage(value) {
  return value.length >= 10 ? '' : 'Сообщение должно содержать не менее 10 символов.';
}

function getTodayString() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${today.getFullYear()}-${month}-${day}`;
}

function validateDate(value) {
  return value >= getTodayString() ? '' : 'Дата связи не может быть в прошлом.';
}

// Правило подбирается по атрибуту name поля.
const fieldValidators = {
  name: validateName,
  email: validateEmail,
  phone: validatePhone,
  tel: validatePhone,
  address: validateAddress,
  message: validateMessage,
  date: validateDate
};

function getFieldLabel(field) {
  const label = field.labels && field.labels[0];
  return label ? label.textContent.trim().replace(/\s+/g, ' ') : field.name;
}

// Возвращает текст ошибки или пустую строку, если поле заполнено верно.
function validateField(field) {
  if (field.type === 'checkbox') {
    return field.required && !field.checked
      ? 'Подтвердите согласие на обработку данных.'
      : '';
  }

  const value = field.value.trim();

  if (value === '') {
    return field.required ? `Заполните поле «${getFieldLabel(field)}».` : '';
  }

  const validator = fieldValidators[field.name];
  return validator ? validator(value) : '';
}

/* ---------- Вывод ошибок ---------- */

function getFieldWrapper(field) {
  return field.closest('.order-form__field') || field.parentElement;
}

function showFieldError(field, message) {
  const errorId = `${field.id}-error`;
  let errorElement = document.getElementById(errorId);

  if (!errorElement) {
    errorElement = createElement('small', {
      className: 'field-error',
      attrs: { id: errorId }
    });
    getFieldWrapper(field).append(errorElement);
  }

  errorElement.textContent = message;
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', errorId);
}

function clearFieldError(field) {
  const errorElement = document.getElementById(`${field.id}-error`);

  if (errorElement) {
    errorElement.remove();
  }

  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');
}

// Проверяет поле и показывает или убирает ошибку. Возвращает true, если всё верно.
function checkField(field) {
  const message = validateField(field);

  if (message) {
    showFieldError(field, message);
    return false;
  }

  clearFieldError(field);
  return true;
}

/* ---------- Счётчик символов в textarea ---------- */

function initCounter(field) {
  if (field.tagName !== 'TEXTAREA' || !field.maxLength || field.maxLength < 0) {
    return;
  }

  const counter = createElement('small', {
    className: 'field-counter',
    attrs: { 'aria-hidden': 'true', 'data-counter-for': field.id }
  });

  getFieldWrapper(field).append(counter);
  updateCounter(field);
}

function updateCounter(field) {
  const counter = document.querySelector(`[data-counter-for="${field.id}"]`);

  if (counter) {
    counter.textContent = `${field.value.length} / ${field.maxLength}`;
  }
}

/* ---------- Отправка ---------- */

function generateOrderNumber() {
  return String(Date.now()).slice(-6);
}

// Текст успешного сообщения. Для заказа он содержит номер и сумму.
function buildSuccessText(form) {
  if (form.dataset.formKind !== 'order') {
    return form.dataset.successText || 'Форма отправлена.';
  }

  const totals = calculateTotals();
  const cartInfo = totals.units > 0
    ? ` Товаров: ${totals.units}, сумма к оплате — ${formatPrice(totals.total)}`
    : ' Заявка отправлена без товаров.';

  return `Заявка №${generateOrderNumber()} принята.${cartInfo} Мы свяжемся с вами по телефону.`;
}

function setFormBusy(form, isBusy, submitButton, defaultText) {
  form.setAttribute('aria-busy', String(isBusy));
  submitButton.disabled = isBusy;
  submitButton.textContent = isBusy ? 'Отправляем…' : defaultText;
}

function finishSubmit(form, formMessage, submitButton, defaultText) {
  const successText = buildSuccessText(form);

  // Корзина очищается только после того, как сумма попала в текст сообщения.
  if (form.dataset.clearsCart === 'true') {
    clearCart();
  }

  form.reset(); // reset убирает старые ошибки и сообщения
  setFormBusy(form, false, submitButton, defaultText);
  setMessage(formMessage, successText, 'success');
  formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const dialog = form.closest('dialog');

  if (dialog) {
    setTimeout(() => dialog.close(), DIALOG_CLOSE_DELAY_MS);
  }
}

function handleSubmit(event, form, fields, formMessage) {
  event.preventDefault();

  if (form.getAttribute('aria-busy') === 'true') {
    return;
  }

  // Проверяем все поля, а не только до первой ошибки.
  const invalidFields = fields.filter((field) => !checkField(field));

  if (invalidFields.length > 0) {
    const count = invalidFields.length;
    const word = pluralize(count, ['поле', 'поля', 'полей']);

    setMessage(formMessage, `Форма не отправлена: проверьте ${count} ${word}.`, 'error');
    invalidFields[0].focus();
    return;
  }

  const submitButton = form.querySelector('[type="submit"]');
  const defaultText = submitButton.textContent;

  setFormBusy(form, true, submitButton, defaultText);
  setMessage(formMessage, 'Отправляем данные…', 'info');

  setTimeout(() => {
    finishSubmit(form, formMessage, submitButton, defaultText);
  }, SUBMIT_DELAY_MS);
}

/* ---------- Подключение формы ---------- */

function initForm(form) {
  const fields = Array.from(form.querySelectorAll('input, select, textarea'))
    .filter((field) => field.type !== 'hidden' && field.id);
  const formMessage = form.querySelector('.form-message');

  fields.forEach(initCounter);

  // Ошибка появляется, когда пользователь ушёл из непустого поля.
  form.addEventListener('focusout', (event) => {
    const field = event.target;

    if (fields.includes(field) && field.type !== 'checkbox' && field.value.trim() !== '') {
      checkField(field);
    }
  });

  // Пока у поля есть ошибка, перепроверяем его при каждом вводе.
  form.addEventListener('input', (event) => {
    const field = event.target;

    if (!fields.includes(field)) {
      return;
    }

    updateCounter(field);

    if (field.hasAttribute('aria-invalid')) {
      checkField(field);
    }
  });

  form.addEventListener('change', (event) => {
    const field = event.target;

    if (fields.includes(field) && (field.type === 'checkbox' || field.hasAttribute('aria-invalid'))) {
      checkField(field);
    }
  });

  form.addEventListener('submit', (event) => handleSubmit(event, form, fields, formMessage));

  // Кнопка «Очистить» (type="reset") и form.reset() убирают ошибки и сообщение.
  form.addEventListener('reset', () => {
    fields.forEach(clearFieldError);
    setMessage(formMessage, '', '');
    setTimeout(() => fields.forEach(updateCounter), 0);
  });
}

document.querySelectorAll('form[data-validate]').forEach(initForm);
