'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  formatLocalizedPrice,
  useLanguage,
  useTranslation,
} from '../lib/i18n/context';
import {
  CartState,
  ShopDelivery,
  ShopPayment,
  VALID_COUPON,
  getCartCount,
  getCartLines,
} from './shopCartUtils';
import { ShopProduct } from './shopData';
import TurnstileField from './TurnstileField';

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
  onOrderSuccess?: () => void;
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
  onOrderSuccess,
}: ShopCartDrawerProps) {
  const t = useTranslation();
  const { lang } = useLanguage();
  const cartT = t.shop.cart;
  const lines = getCartLines(cart, products);
  const count = getCartCount(cart);
  // Home delivery + Valitor are shown but disabled until ready.
  const delivery: ShopDelivery = 'pickup';
  const payment: ShopPayment = 'pay_on_site';
  const [turnstileToken, setTurnstileToken] = useState('');
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const onToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('shop-drawer-open', open);
    return () => document.body.classList.remove('shop-drawer-open');
  }, [open]);

  function productName(_id: string, fallback: string) {
    return fallback;
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setFormError('');
    setFormSuccess(false);

    const needsCaptcha = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    if (needsCaptcha && !turnstileToken) {
      setFormError(cartT.errors.captcha);
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/shop/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name') || ''),
          phone: String(data.get('phone') || ''),
          email: String(data.get('email') || ''),
          address: String(data.get('address') || ''),
          notes: String(data.get('notes') || ''),
          delivery,
          payment,
          coupon: appliedCoupon,
          lang,
          cart,
          products,
          turnstileToken,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        const err = result.error || 'send_failed';
        setFormError(
          err === 'captcha_failed'
            ? cartT.errors.captcha
            : err === 'mail_not_configured'
              ? cartT.errors.mailNotConfigured
              : cartT.errors.sendFailed
        );
        return;
      }

      setFormSuccess(true);
      setTurnstileToken('');
      onOrderSuccess?.();
    } catch {
      setFormError(cartT.errors.sendFailed);
    } finally {
      setSending(false);
    }
  }

  const submitLabel = sending ? cartT.sending : cartT.sendOrderPayOnSite;

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
                          {product.image ? (
                            <img
                              className="shop-drawer-line-image"
                              src={product.image}
                              alt={product.name}
                            />
                          ) : (
                            <div className="shop-bottle shop-bottle-mini">
                              <span>{product.size}</span>
                            </div>
                          )}
                        </div>
                        <div className="shop-drawer-line-copy">
                          <h3>{productName(product.id, product.name)}</h3>
                          <p className="shop-drawer-line-price">
                            {product.compareAtPrice &&
                            product.compareAtPrice > product.price ? (
                              <s>
                                {formatLocalizedPrice(
                                  lang,
                                  product.compareAtPrice
                                )}
                              </s>
                            ) : null}
                            <span>
                              {formatLocalizedPrice(lang, product.price)}
                            </span>
                          </p>
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

              <div className="shop-checkout-section">
                <p className="shop-checkout-section-label">{cartT.detailsTitle}</p>
                <div className="shop-checkout-grid">
                  <label>
                    {cartT.name}
                    <input
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder={cartT.namePlaceholder}
                    />
                  </label>
                  <label>
                    {cartT.phone}
                    <input
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder={cartT.phonePlaceholder}
                    />
                  </label>
                  <label className="shop-checkout-wide">
                    {cartT.email}
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder={cartT.emailPlaceholder}
                    />
                  </label>
                </div>
              </div>

              <fieldset className="shop-choice-set">
                <legend>{cartT.delivery}</legend>
                <input type="hidden" name="delivery" value="pickup" />
                <label className="shop-choice shop-choice-active">
                  <input
                    type="radio"
                    name="delivery_ui"
                    value="pickup"
                    checked
                    onChange={() => undefined}
                  />
                  <span>
                    <strong>{cartT.deliveryPickup}</strong>
                    <small>{cartT.deliveryPickupHint}</small>
                  </span>
                </label>
                <label className="shop-choice shop-choice-disabled">
                  <input
                    type="radio"
                    name="delivery_ui"
                    value="delivery"
                    disabled
                  />
                  <span>
                    <span className="shop-choice-title-row">
                      <strong>{cartT.deliveryHome}</strong>
                      <em>{cartT.comingSoon}</em>
                    </span>
                    <small>{cartT.deliveryHomeHint}</small>
                  </span>
                </label>
              </fieldset>

              <fieldset className="shop-choice-set">
                <legend>{cartT.payment}</legend>
                <input type="hidden" name="payment" value="pay_on_site" />
                <label className="shop-choice shop-choice-active">
                  <input
                    type="radio"
                    name="payment_ui"
                    value="pay_on_site"
                    checked
                    onChange={() => undefined}
                  />
                  <span>
                    <strong>{cartT.paymentOnSite}</strong>
                    <small>{cartT.paymentOnSiteHint}</small>
                  </span>
                </label>
                <label className="shop-choice shop-choice-disabled">
                  <input
                    type="radio"
                    name="payment_ui"
                    value="card_valitor"
                    disabled
                  />
                  <span>
                    <span className="shop-choice-title-row">
                      <strong>{cartT.paymentCard}</strong>
                      <em>{cartT.comingSoon}</em>
                    </span>
                    <small>{cartT.paymentCardHint}</small>
                  </span>
                </label>
              </fieldset>

              <label className="shop-checkout-notes">
                {cartT.notes}
                <textarea
                  name="notes"
                  rows={3}
                  placeholder={cartT.notesPlaceholder}
                />
              </label>

              <TurnstileField onToken={onToken} />

              <div className="shop-checkout-summary">
                <div>
                  <span>
                    {count + ' ' + (count === 1 ? cartT.item : cartT.items)}
                  </span>
                  {discount > 0 && (
                    <small>
                      {cartT.discountLabel +
                        ' -' +
                        formatLocalizedPrice(lang, discount)}
                    </small>
                  )}
                </div>
                <strong>{formatLocalizedPrice(lang, grandTotal)}</strong>
              </div>

              {formSuccess ? (
                <p className="shop-form-ok">{cartT.success}</p>
              ) : null}
              {formError ? <p className="shop-form-error">{formError}</p> : null}

              <button
                type="submit"
                className="shop-drawer-primary"
                disabled={sending || formSuccess}
              >
                {submitLabel}
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
