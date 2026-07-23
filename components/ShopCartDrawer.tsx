'use client';

import { FormEvent, useEffect } from 'react';
import {
  formatLocalizedPrice,
  useLanguage,
  useTranslation,
} from '../lib/i18n/context';
import { brand } from '../lib/brand';
import {
  CartState,
  VALID_COUPON,
  buildOrderMailBody,
  getCartCount,
  getCartLines,
} from './shopCartUtils';
import { ShopProduct } from './shopData';

type DrawerStep = 'cart' | 'checkout';

type ShopCartDrawerProps = {
  open: boolean;
  step: DrawerStep;
  cart: CartState;
  products: ShopProduct[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  couponInput: string;
  couponError: string;
  appliedCoupon: string | null;
  onClose: () => void;
  onStepChange: (step: DrawerStep) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCouponInputChange: (value: string) => void;
  onApplyCoupon: () => void;
  onClearCoupon: () => void;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function ShopCartDrawer({
  open,
  step,
  cart,
  products,
  subtotal,
  discount,
  grandTotal,
  couponInput,
  couponError,
  appliedCoupon,
  onClose,
  onStepChange,
  onUpdateQty,
  onRemove,
  onCouponInputChange,
  onApplyCoupon,
  onClearCoupon,
}: ShopCartDrawerProps) {
  const t = useTranslation();
  const { lang } = useLanguage();
  const cartT = t.shop.cart;
  const lines = getCartLines(cart, products);
  const count = getCartCount(cart);

  useEffect(() => {
    document.body.classList.toggle('shop-drawer-open', open);
    return () => document.body.classList.remove('shop-drawer-open');
  }, [open]);

  function productName(id: string, fallback: string) {
    return t.shop.products[id as keyof typeof t.shop.products]?.name ?? fallback;
  }

  function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const body = buildOrderMailBody(
      cart,
      {
        name: String(data.get('name') || ''),
        phone: String(data.get('phone') || ''),
        email: String(data.get('email') || ''),
        address: String(data.get('address') || ''),
        delivery: String(data.get('delivery') || ''),
        notes: String(data.get('notes') || ''),
      },
      appliedCoupon,
      lang,
      products
    );

    const subject = encodeURIComponent(
      cartT.orderSubject + ' ' + String(data.get('name') || brand.logoPrimary)
    );

    window.location.href =
      'mailto:' + brand.email + '?subject=' + subject + '&body=' + encodeURIComponent(body);
  }

  return (
    <>
      <button
        type="button"
        className={'shop-drawer-backdrop' + (open ? ' open' : '')}
        aria-label={cartT.closeCart}
        onClick={onClose}
      />

      <aside
        className={'shop-drawer' + (open ? ' open' : '')}
        aria-hidden={!open}
        aria-label={cartT.cartLabel}
      >
        <div className="shop-drawer-head">
          <div>
            <p className="shop-drawer-kicker">{cartT.kicker}</p>
            <h2>{step === 'cart' ? cartT.cartTitle : cartT.detailsTitle}</h2>
          </div>
          <button type="button" className="shop-drawer-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="shop-drawer-steps">
          <button
            type="button"
            className={step === 'cart' ? 'active' : ''}
            onClick={() => onStepChange('cart')}
          >
            <span>1</span>
            {cartT.stepCart}
          </button>
          <button
            type="button"
            className={step === 'checkout' ? 'active' : ''}
            onClick={() => count > 0 && onStepChange('checkout')}
            disabled={count === 0}
          >
            <span>2</span>
            {cartT.stepDetails}
          </button>
        </div>

        <div className="shop-drawer-body">
          {step === 'cart' ? (
            <>
              {lines.length === 0 ? (
                <div className="shop-drawer-empty">
                  <p>{cartT.empty}</p>
                  <button type="button" onClick={onClose}>
                    {cartT.continueShopping}
                  </button>
                </div>
              ) : (
                <>
                  <div className="shop-drawer-lines">
                    {lines.map(({ product, qty, lineTotal }) => (
                      <article className="shop-drawer-line" key={product.id}>
                        <div className={'shop-drawer-line-thumb shop-card-' + product.tone}>
                          <div className="shop-bottle shop-bottle-mini">
                            <span>{product.size}</span>
                          </div>
                        </div>
                        <div className="shop-drawer-line-copy">
                          <h3>{productName(product.id, product.name)}</h3>
                          <p>{formatLocalizedPrice(lang, product.price)}</p>
                          <div className="shop-drawer-qty">
                            <button
                              type="button"
                              aria-label={cartT.decreaseQty}
                              onClick={() => onUpdateQty(product.id, qty - 1)}
                            >
                              -
                            </button>
                            <span>{qty}</span>
                            <button
                              type="button"
                              aria-label={cartT.increaseQty}
                              onClick={() => onUpdateQty(product.id, qty + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="shop-drawer-line-side">
                          <strong>{formatLocalizedPrice(lang, lineTotal)}</strong>
                          <button
                            type="button"
                            className="shop-drawer-remove"
                            onClick={() => onRemove(product.id)}
                          >
                            {cartT.remove}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="shop-coupon-box">
                    <label htmlFor="shop-coupon">{cartT.discountCode}</label>
                    <div className="shop-coupon-row">
                      <input
                        id="shop-coupon"
                        type="text"
                        value={couponInput}
                        placeholder={VALID_COUPON + ' (-20%)'}
                        onChange={(event) => onCouponInputChange(event.target.value)}
                      />
                      <button type="button" onClick={onApplyCoupon}>
                        {cartT.apply}
                      </button>
                    </div>
                    {appliedCoupon && (
                      <p className="shop-coupon-success">
                        {VALID_COUPON + cartT.couponActive}
                        <button type="button" onClick={onClearCoupon}>
                          {cartT.remove}
                        </button>
                      </p>
                    )}
                    {couponError && <p className="shop-coupon-error">{couponError}</p>}
                  </div>
                </>
              )}
            </>
          ) : (
            <form className="shop-checkout-form" onSubmit={handleCheckout}>
              <p className="shop-checkout-lead">{cartT.checkoutLead}</p>

              <div className="shop-checkout-grid">
                <label>
                  {cartT.name}
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder={cartT.namePlaceholder}
                  />
                </label>
                <label>
                  {cartT.phone}
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder={cartT.phonePlaceholder}
                  />
                </label>
                <label>
                  {cartT.email}
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder={cartT.emailPlaceholder}
                  />
                </label>
                <label>
                  {cartT.address}
                  <input
                    name="address"
                    type="text"
                    required
                    placeholder={cartT.addressPlaceholder}
                  />
                </label>
                <label className="shop-checkout-wide">
                  {cartT.delivery}
                  <select name="delivery" defaultValue="pickup" required>
                    <option value="pickup">{cartT.deliveryPickup}</option>
                    <option value="delivery">{cartT.deliveryHome}</option>
                  </select>
                </label>
                <label className="shop-checkout-wide">
                  {cartT.notes}
                  <textarea
                    name="notes"
                    rows={4}
                    placeholder={cartT.notesPlaceholder}
                  />
                </label>
              </div>

              <div className="shop-checkout-summary">
                <div>
                  <span>
                    {count + ' ' + (count === 1 ? cartT.item : cartT.items)}
                  </span>
                  {discount > 0 && (
                    <small>
                      {cartT.discountLabel + ' -' + formatLocalizedPrice(lang, discount)}
                    </small>
                  )}
                </div>
                <strong>{formatLocalizedPrice(lang, grandTotal)}</strong>
              </div>

              <button type="submit" className="shop-drawer-primary">
                {cartT.sendOrder}
              </button>
            </form>
          )}
        </div>

        {step === 'cart' && lines.length > 0 && (
          <div className="shop-drawer-foot">
            <div className="shop-drawer-total shop-drawer-total-stack">
              <div>
                <span>{cartT.subtotal}</span>
                <strong>{formatLocalizedPrice(lang, subtotal)}</strong>
              </div>
              {discount > 0 && (
                <div>
                  <span>{cartT.discount}</span>
                  <strong>{'-' + formatLocalizedPrice(lang, discount)}</strong>
                </div>
              )}
              <div>
                <span>{cartT.total}</span>
                <strong>{formatLocalizedPrice(lang, grandTotal)}</strong>
              </div>
            </div>
            <button
              type="button"
              className="shop-drawer-primary"
              onClick={() => onStepChange('checkout')}
            >
              {cartT.continue}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
