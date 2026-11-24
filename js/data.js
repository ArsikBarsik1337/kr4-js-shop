/* =========================================================
   data.js — данные магазина.
   products   — массив из 10 товаров с одинаковой структурой;
   categories — категории (совпадают со значениями фильтра);
   promoCodes — промокоды для корзины.
   ========================================================= */

/*
  Структура товара (одинаковая у всех):
  id              — уникальный номер;
  title           — название;
  category        — id категории из массива categories;
  price           — цена без скидки, число;
  discountPercent — скидка в процентах (0 — без скидки);
  isAvailable     — есть ли товар в наличии;
  isNew           — показывать ли бейдж «Новинка»;
  description     — краткое описание;
  image           — путь к изображению.
*/
const products = [
  {
    id: 1,
    title: 'Телифон',
    category: 'arachnids',
    price: 6000,
    discountPercent: 10,
    isAvailable: true,
    isNew: false,
    description: 'Относится к отряду тропических и субтропических паукообразных.',
    image: 'images/telifon-640.webp'
  },
  {
    id: 2,
    title: 'Козявка',
    category: 'beetles',
    price: 2000,
    discountPercent: 0,
    isAvailable: false,
    isNew: false,
    description: 'Относится к подсемейству жуков из семейства листоедов.',
    image: 'images/kozyavka.webp'
  },
  {
    id: 3,
    title: 'Майка',
    category: 'beetles',
    price: 1000,
    discountPercent: 0,
    isAvailable: true,
    isNew: false,
    description: 'Относится к роду нарывников из подсемейства Meloinae.',
    image: 'images/maika.webp'
  },
  {
    id: 4,
    title: 'Притворяшка',
    category: 'beetles',
    price: 3500,
    discountPercent: 0,
    isAvailable: true,
    isNew: true,
    description: 'Жуки мелких размеров. Усики пиловидные или нитевидные, не имеют увеличенных последних члеников.',
    image: 'images/pritvoryashka.webp'
  },
  {
    id: 5,
    title: 'Дедка обыкновенный',
    category: 'winged_insects',
    price: 4200,
    discountPercent: 5,
    isAvailable: true,
    isNew: false,
    description: 'Глаза голубовато-зеленого или серо-зеленого цвета, разделены жёлтым лбом.',
    image: 'images/dedka.webp'
  },
  {
    id: 6,
    title: 'Медляк-вещатель',
    category: 'beetles',
    price: 5500,
    discountPercent: 0,
    isAvailable: true,
    isNew: false,
    description: 'Живут в подвалах.',
    image: 'images/medlyak.webp'
  },
  {
    id: 7,
    title: 'Фигня мелкая',
    category: 'winged_insects',
    price: 7500,
    discountPercent: 5,
    isAvailable: true,
    isNew: true,
    description: 'Вид бабочек рода Fignya семейства слизневидок.',
    image: 'images/fignya.webp'
  },
  {
    id: 8,
    title: 'Притворяшка-вор',
    category: 'beetles',
    price: 1500,
    discountPercent: 0,
    isAvailable: true,
    isNew: true,
    description: 'Самец бурый, самка чёрная с овальными надкрыльями.',
    image: 'images/vor.webp'
  },
  {
    id: 9,
    title: 'Страшила невероятная',
    category: 'winged_insects',
    price: 99999,
    discountPercent: 0,
    isAvailable: false,
    isNew: false,
    description: 'Ископаемый вид двукрылых насекомых из отложений юрского периода Сибири.',
    image: 'images/strashila.webp'
  },
  {
    id: 10,
    title: 'Карапузик',
    category: 'beetles',
    price: 1200,
    discountPercent: 0,
    isAvailable: true,
    isNew: false,
    description: 'Длиной от 1 до 25 мм, но обычно их размеры не превышают 10 мм.',
    image: 'images/karapuzik.webp'
  }
];

const categories = [
  { id: 'beetles', title: 'Жуки' },
  { id: 'arachnids', title: 'Паукообразные' },
  { id: 'winged_insects', title: 'Крылатые насекомые' }
];

/*
  Промокоды.
  type: 'percent' — скидка в процентах от суммы товаров,
        'fixed'   — фиксированная сумма в рублях;
  minTotal      — минимальная сумма заказа, с которой код действует.
*/
const promoCodes = {
  BUGS10: { type: 'percent', value: 10, description: 'Скидка 10% на заказ' },
  WELCOME500: { type: 'fixed', value: 500, minTotal: 3000, description: 'Скидка 500 руб. при заказе от 3 000 руб.' }
};
