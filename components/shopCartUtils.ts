import { translations } from '../lib/i18n/translations';
import { formatLocalizedPrice } from '../lib/i18n/context';
import { Language } from '../lib/i18n/types';
import { ShopProduct, shopProducts } from './shopData';

export type CartState = Record<string, number>;

export function getCartLines(
  cart: CartState,
  products: ShopProduct[] = shopProducts
) {
  return products
    .filter((product) => (cart[product.id] || 0) > 0)
    .map((product) => ({
      product,
      qty: cart[product.id],
      lineTotal: cart[product.id] * product.price,
    }));
}

export function getCartCount(cart: CartState) {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

export function getCartTotal(
  cart: CartState,
  products: ShopProduct[] = shopProducts
) {
  return getCartLines(cart, products).reduce(
    (sum, line) => sum + line.lineTotal,
    0
  );
}

export const VALID_COUPON = 'KSP';
export const COUPON_DISCOUNT_RATE = 0.2;

export function normalizeCoupon(code: string) {
  return code.trim().toUpperCase();
}

export function isValidCoupon(code: string) {
  return normalizeCoupon(code) === VALID_COUPON;
}

export function getCartDiscount(subtotal: number, appliedCoupon: string | null) {
  if (!appliedCoupon || !isValidCoupon(appliedCoupon)) {
    return 0;
  }

  return Math.round(subtotal * COUPON_DISCOUNT_RATE);
}

export function getCartGrandTotal(
  cart: CartState,
  appliedCoupon: string | null,
  products: ShopProduct[] = shopProducts
) {
  const subtotal = getCartTotal(cart, products);
  return subtotal - getCartDiscount(subtotal, appliedCoupon);
}

export type ShopDelivery = 'pickup' | 'delivery';
export type ShopPayment = 'pay_on_site' | 'card_valitor';

export function buildOrderMailBody(
  cart: CartState,
  form: {
    name: string;
    phone: string;
    email: string;
    address: string;
    delivery: string;
    payment: string;
    notes: string;
  },
  appliedCoupon: string | null = null,
  lang: Language = 'is',
  products: ShopProduct[] = shopProducts
) {
  const cartT = translations[lang].shop.cart;
  const lines = getCartLines(cart, products);
  const subtotal = getCartTotal(cart, products);
  const discount = getCartDiscount(subtotal, appliedCoupon);
  const grandTotal = subtotal - discount;
  const deliveryLabel =
    form.delivery === 'pickup' ? cartT.deliveryPickup : cartT.deliveryHome;
  const paymentLabel =
    form.payment === 'card_valitor'
      ? cartT.paymentCard
      : cartT.paymentOnSite;
  const items = lines
    .map((line) => {
      return (
        '- ' +
        line.product.name +
        ' (' +
        line.product.size +
        ') x' +
        line.qty +
        ' = ' +
        formatLocalizedPrice(lang, line.lineTotal)
      );
    })
    .join('\n');

  return (
    cartT.orderSubject +
    ' KS Protect online shop\n\n' +
    cartT.name +
    ': ' +
    form.name +
    '\n' +
    cartT.phone +
    ': ' +
    form.phone +
    '\n' +
    cartT.email +
    ': ' +
    form.email +
    '\n' +
    cartT.address +
    ': ' +
    (form.address || '-') +
    '\n' +
    cartT.delivery +
    ': ' +
    deliveryLabel +
    '\n' +
    cartT.payment +
    ': ' +
    paymentLabel +
    '\n\nProducts:\n' +
    items +
    '\n\n' +
    cartT.subtotal +
    ': ' +
    formatLocalizedPrice(lang, subtotal) +
    (discount > 0
      ? '\n' +
        cartT.discountLabel +
        ' (' +
        VALID_COUPON +
        ' -20%): -' +
        formatLocalizedPrice(lang, discount)
      : '') +
    '\n' +
    cartT.total +
    ': ' +
    formatLocalizedPrice(lang, grandTotal) +
    (form.notes ? '\n\n' + cartT.notes + ':\n' + form.notes : '')
  );
}

export function findProduct(
  id: string,
  products: ShopProduct[] = shopProducts
): ShopProduct | undefined {
  return products.find((product) => product.id === id);
}
