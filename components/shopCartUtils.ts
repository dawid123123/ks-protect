import { translations } from '../lib/i18n/translations';
import { formatLocalizedPrice } from '../lib/i18n/context';
import { Language } from '../lib/i18n/types';
import { ShopProduct, shopProducts } from './shopData';

export type CartState = Record<string, number>;

export function getCartLines(cart: CartState) {
  return shopProducts
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

export function getCartTotal(cart: CartState) {
  return getCartLines(cart).reduce((sum, line) => sum + line.lineTotal, 0);
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

export function getCartGrandTotal(cart: CartState, appliedCoupon: string | null) {
  const subtotal = getCartTotal(cart);
  return subtotal - getCartDiscount(subtotal, appliedCoupon);
}

export function buildOrderMailBody(
  cart: CartState,
  form: {
    name: string;
    phone: string;
    email: string;
    address: string;
    delivery: string;
    notes: string;
  },
  appliedCoupon: string | null = null,
  lang: Language = 'is'
) {
  const cartT = translations[lang].shop.cart;
  const productLabels = translations[lang].shop.products;
  const lines = getCartLines(cart);
  const subtotal = getCartTotal(cart);
  const discount = getCartDiscount(subtotal, appliedCoupon);
  const grandTotal = subtotal - discount;
  const deliveryLabel =
    form.delivery === 'pickup' ? cartT.deliveryPickup : cartT.deliveryHome;
  const items = lines
    .map((line) => {
      const productCopy =
        productLabels[line.product.id as keyof typeof productLabels];
      const name = productCopy?.name ?? line.product.name;
      return (
        '- ' +
        name +
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
    form.address +
    '\n' +
    cartT.delivery +
    ': ' +
    deliveryLabel +
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

export function findProduct(id: string): ShopProduct | undefined {
  return shopProducts.find((product) => product.id === id);
}
