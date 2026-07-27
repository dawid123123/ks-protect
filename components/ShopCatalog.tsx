'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  formatLocalizedPrice,
  useLanguage,
  useTranslation,
} from '../lib/i18n/context';
import {
  cloneDefaultCategories,
  cloneDefaultProducts,
  loadPublicCatalog,
  loadStoredCatalog,
  saveStoredCatalog,
} from '../lib/shopStorage';
import ShopAdmin from './ShopAdmin';
import ShopCartDrawer from './ShopCartDrawer';
import {
  getCartCount,
  getCartDiscount,
  getCartGrandTotal,
  getCartTotal,
  isValidCoupon,
  normalizeCoupon,
} from './shopCartUtils';
import {
  ShopCategory,
  ShopCategoryDef,
  ShopProduct,
  categoryLabel,
  getProductCategories,
  getSalePercent,
  productHasCategory,
} from './shopData';

type SortMode = 'default' | 'price-asc' | 'price-desc' | 'name';
type DrawerStep = 'cart' | 'checkout';

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 4h-2l-1 2H3v2h1.2l2.4 8.4A2 2 0 0 0 8.5 18h9a2 2 0 0 0 1.9-1.4L21 8H6.3M8.5 20a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ShopCatalog() {
  const t = useTranslation();
  const { lang } = useLanguage();
  const [products, setProducts] = useState<ShopProduct[]>(() =>
    cloneDefaultProducts()
  );
  const [categories, setCategories] = useState<ShopCategoryDef[]>(() =>
    cloneDefaultCategories()
  );
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<ShopCategory>('all');
  const [sort, setSort] = useState<SortMode>('default');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState<DrawerStep>('cart');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);

  function applyCatalog(nextProducts: ShopProduct[], nextCategories?: ShopCategoryDef[]) {
    setProducts(nextProducts);
    const cats = nextCategories?.length
      ? nextCategories
      : cloneDefaultCategories();
    setCategories(cats);
    saveStoredCatalog(nextProducts, cats);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch('/api/shop/products', { cache: 'no-store' });
        if (response.ok) {
          const data = (await response.json()) as {
            products?: ShopProduct[];
            categories?: ShopCategoryDef[];
          };
          if (!cancelled && Array.isArray(data.products) && data.products.length) {
            applyCatalog(data.products, data.categories);
            setReady(true);
            return;
          }
        }
      } catch {
        // fall through
      }

      const stored = loadStoredCatalog();
      if (stored) {
        if (!cancelled) {
          applyCatalog(stored.products, stored.categories);
          setReady(true);
        }
        return;
      }

      const published = await loadPublicCatalog();
      if (!cancelled) {
        if (published) {
          applyCatalog(published.products, published.categories);
        } else {
          applyCatalog(cloneDefaultProducts(), cloneDefaultCategories());
        }
        setReady(true);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProducts = useMemo(
    () => products.filter((item) => item.active !== false),
    [products]
  );

  const filtered = useMemo(() => {
    let items =
      category === 'all'
        ? visibleProducts
        : visibleProducts.filter((item) => productHasCategory(item, category));

    if (sort === 'price-asc') {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      items = [...items].sort((a, b) => b.price - a.price);
    } else if (sort === 'name') {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name, 'is'));
    }

    return items;
  }, [category, sort, visibleProducts]);

  const cartCount = getCartCount(cart);
  const subtotal = getCartTotal(cart, products);
  const discount = getCartDiscount(subtotal, appliedCoupon);
  const grandTotal = getCartGrandTotal(cart, appliedCoupon, products);

  function openDrawer(nextStep: DrawerStep = 'cart') {
    setDrawerStep(nextStep);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerStep('cart');
  }

  function addToCart(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    setCart((prev) => ({ ...prev, [id]: qty }));
  }

  function removeFromCart(id: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function applyCoupon() {
    const code = normalizeCoupon(couponInput);

    if (!code) {
      setAppliedCoupon(null);
      setCouponError('');
      return;
    }

    if (isValidCoupon(code)) {
      setAppliedCoupon(code);
      setCouponError('');
      return;
    }

    setAppliedCoupon(null);
    setCouponError(t.shop.couponErrors.invalid);
  }

  function clearCoupon() {
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponError('');
  }

  function badgeLabel(badge: string | undefined) {
    if (badge === 'POPULAR') {
      return t.shop.badges.popular;
    }
    if (badge === 'TOP') {
      return t.shop.badges.top;
    }
    if (badge === 'UPPSELT') {
      return lang === 'en' ? 'OUT OF STOCK' : 'UPPSELT';
    }
    return badge;
  }

  function isOutOfStock(product: ShopProduct) {
    return product.badge === 'UPPSELT';
  }

  function onSecretClick() {
    const next = secretClicks + 1;
    setSecretClicks(next);
    if (next >= 5) {
      setAdminOpen(true);
      setSecretClicks(0);
    }
  }

  return (
    <>
      <section className="shop-page">
        <div className="shop-shell">
          <div className="shop-hero">
            <div>
              <p
                className="eyebrow shop-admin-trigger"
                onClick={onSecretClick}
                title=""
              >
                {t.shop.eyebrow}
              </p>
              <h1>{t.shop.title}</h1>
              <p className="shop-lead">{t.shop.lead}</p>
            </div>
          </div>

          <div className="shop-layout">
            <aside className="shop-sidebar">
              <div className="shop-panel">
                <h3>{lang === 'en' ? 'CATEGORIES' : 'FLOKKAR'}</h3>
                <div className="shop-category-list">
                  <button
                    type="button"
                    className={category === 'all' ? 'active' : ''}
                    onClick={() => setCategory('all')}
                  >
                    {t.shop.categories.all}
                  </button>
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={category === item.id ? 'active' : ''}
                      onClick={() => setCategory(item.id)}
                    >
                      {categoryLabel(item, lang)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shop-panel shop-panel-note">
                <h3>{t.shop.pickUpInStore}</h3>
                <p>{t.shop.pickUpNote}</p>
              </div>
            </aside>

            <div className="shop-main">
              <div className="shop-toolbar">
                <p>
                  {ready ? filtered.length : '...'}{' '}
                  {filtered.length === 1
                    ? t.shop.productCount
                    : t.shop.productCountPlural}
                </p>
                <label className="shop-sort">
                  <span>{t.shop.sort}</span>
                  <select
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as SortMode)
                    }
                  >
                    <option value="default">{t.shop.sortDefault}</option>
                    <option value="price-asc">{t.shop.sortPriceAsc}</option>
                    <option value="price-desc">{t.shop.sortPriceDesc}</option>
                    <option value="name">{t.shop.sortName}</option>
                  </select>
                </label>
              </div>

              <div className="shop-grid">
                {filtered.map((product) => {
                  const salePercent = getSalePercent(product);
                  return (
                    <article
                      className={'shop-card shop-card-' + product.tone}
                      key={product.id}
                    >
                      {salePercent > 0 ? (
                        <span className="shop-card-badge shop-card-badge-sale">
                          -{salePercent}%
                        </span>
                      ) : product.badge ? (
                        <span className="shop-card-badge">
                          {badgeLabel(product.badge)}
                        </span>
                      ) : null}
                      <div className="shop-card-visual">
                        {product.image ? (
                          <img
                            className="shop-card-image"
                            src={product.image}
                            alt={product.name}
                          />
                        ) : (
                          <div className="shop-bottle" aria-hidden="true" />
                        )}
                      </div>
                      <div className="shop-card-meta">
                        <div className="shop-card-meta-top">
                          <span>
                            {getProductCategories(product)
                              .map((id) =>
                                categoryLabel(
                                  categories.find((c) => c.id === id),
                                  lang,
                                  id
                                )
                              )
                              .join(' · ')}
                          </span>
                          {product.size ? (
                            <em className="shop-card-size">{product.size}</em>
                          ) : null}
                        </div>
                        <h3>{product.name}</h3>
                        <p className="shop-card-blurb">
                          {product.subtitle || product.description}
                        </p>
                      </div>
                      <div className="shop-card-footer">
                        <div className="shop-card-price">
                          {salePercent > 0 && product.compareAtPrice ? (
                            <s>
                              {formatLocalizedPrice(lang, product.compareAtPrice)}
                            </s>
                          ) : null}
                          <strong>
                            {formatLocalizedPrice(lang, product.price)}
                          </strong>
                        </div>
                        <button
                          type="button"
                          disabled={isOutOfStock(product)}
                          onClick={() => addToCart(product.id)}
                        >
                          <CartIcon />
                          {isOutOfStock(product)
                            ? badgeLabel('UPPSELT')
                            : t.shop.addToCart}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        className={'shop-cart-fab' + (drawerOpen ? ' shop-cart-fab-open' : '')}
        onClick={() => (drawerOpen ? closeDrawer() : openDrawer('cart'))}
        aria-label={t.shop.openCart}
      >
        <CartIcon />
        <span>{cartCount}</span>
        <strong>{formatLocalizedPrice(lang, grandTotal)}</strong>
      </button>

      <ShopCartDrawer
        open={drawerOpen}
        step={drawerStep}
        cart={cart}
        products={products}
        subtotal={subtotal}
        discount={discount}
        grandTotal={grandTotal}
        couponInput={couponInput}
        couponError={couponError}
        appliedCoupon={appliedCoupon}
        onClose={closeDrawer}
        onStepChange={setDrawerStep}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onCouponInputChange={setCouponInput}
        onApplyCoupon={applyCoupon}
        onClearCoupon={clearCoupon}
        onOrderSuccess={() => {
          setCart({});
          setAppliedCoupon(null);
          setCouponInput('');
        }}
      />

      <ShopAdmin
        open={adminOpen}
        products={products}
        categories={categories}
        onClose={() => setAdminOpen(false)}
        onCatalogChange={(nextProducts, nextCategories) => {
          applyCatalog(nextProducts, nextCategories);
        }}
      />
    </>
  );
}
