const orderForm = document.querySelector('.order-form');

if (orderForm) {
  const nameInput = orderForm.querySelector('#order-name');
  const emailInput = orderForm.querySelector('#order-email');
  const phoneInput = orderForm.querySelector('#order-phone');

  const nameError = orderForm.querySelector('#order-name-error');
  const emailError = orderForm.querySelector('#order-email-error');
  const phoneError = orderForm.querySelector('#order-phone-error');

  const formMessage = orderForm.querySelector('.form-message');

  function showError(input, errorElement, message) {
    errorElement.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorElement.id);
  }

  function clearError(input, errorElement) {
    errorElement.textContent = '';
    input.removeAttribute('aria-invalid');
  }

  function validateName() {
    const value = nameInput.value.trim();

    if (value.length < 2) {
      showError(nameInput, nameError, 'Введите имя не короче 2 символов.');
      return false;
    }

    clearError(nameInput, nameError);
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value)) {
      showError(emailInput, emailError, 'Введите корректный e-mail.');
      return false;
    }

    clearError(emailInput, emailError);
    return true;
  }

  function validatePhone() {
    const value = phoneInput.value.trim();
    const digits = value.replace(/\D/g, '');

    if (digits.length !== 11 || !['7', '8'].includes(digits[0])) {
      showError(phoneInput, phoneError, 'Введите корректный номер телефона.');
      return false;
    }

    clearError(phoneInput, phoneError);
    return true;
  }

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();

    const isFormValid = isNameValid && isEmailValid && isPhoneValid;

    if (!isFormValid) {
      formMessage.textContent = 'Проверьте поля формы.';
      return;
    }

    const requestData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim()
    };

    console.log('Форма прошла учебную проверку; данные не отправлены.');

    formMessage.textContent = 'Форма прошла учебную проверку. Данные не отправлены.';
    orderForm.reset();
  });

  nameInput.addEventListener('input', validateName);
  emailInput.addEventListener('input', validateEmail);
  phoneInput.addEventListener('input', validatePhone);
}
