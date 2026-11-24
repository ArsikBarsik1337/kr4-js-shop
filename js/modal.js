/* =========================================================
   modal.js — модальное окно быстрой заявки (index.html и
   product.html). Окно — это элемент <dialog>, который
   открывается через showModal(): фокус остаётся внутри окна,
   Escape закрывает его, после закрытия фокус возвращается
   на кнопку, открывшую окно.
   ========================================================= */

const orderDialog = document.querySelector('#order-dialog');

function initOrderDialog() {
  const selectedProductInput = orderDialog.querySelector('#selected-product');
  const dialogProduct = orderDialog.querySelector('[data-dialog-product]');
  const closeButton = orderDialog.querySelector('#close-order-dialog');
  const orderForm = orderDialog.querySelector('form');

  // Делегирование: работает и для кнопок, добавленных скриптом позже.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-product]');

    if (!button) {
      return;
    }

    const productName = button.dataset.product || '';

    selectedProductInput.value = productName;
    dialogProduct.textContent = productName ? `Товар: ${productName}` : '';
    dialogProduct.hidden = productName === '';

    orderDialog.showModal();
  });

  closeButton.addEventListener('click', () => orderDialog.close());

  // Клик по затемнённому фону (вне области окна) закрывает окно.
  orderDialog.addEventListener('click', (event) => {
    if (event.target !== orderDialog) {
      return;
    }

    const area = orderDialog.getBoundingClientRect();
    const isInside = event.clientX >= area.left && event.clientX <= area.right
      && event.clientY >= area.top && event.clientY <= area.bottom;

    if (!isInside) {
      orderDialog.close();
    }
  });

  // При закрытии форма очищается вместе с ошибками и сообщениями.
  orderDialog.addEventListener('close', () => orderForm.reset());
}

if (orderDialog) {
  initOrderDialog();
}
