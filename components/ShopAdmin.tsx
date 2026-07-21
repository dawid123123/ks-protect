'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../lib/i18n/context';
import {
  createProductId,
  resizeImageFile,
  saveStoredProducts,
  clearStoredProducts,
  cloneDefaultProducts,
} from '../lib/shopStorage';
import {
  ShopProduct,
  ShopProductTone,
  shopProductCategories,
  shopTones,
} from './shopData';

type ShopAdminProps = {
  open: boolean;
  products: ShopProduct[];
  onClose: () => void;
  onProductsChange: (products: ShopProduct[]) => void;
};

type Draft = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: Exclude<ShopProduct['category'], never>;
  price: string;
  size: string;
  tone: ShopProductTone;
  badge: string;
  image: string;
  active: boolean;
};

const emptyDraft = (): Draft => ({
  id: '',
  name: '',
  subtitle: '',
  description: '',
  category: 'thvottur',
  price: '',
  size: '',
  tone: 'green',
  badge: '',
  image: '',
  active: true,
});

function productToDraft(product: ShopProduct): Draft {
  return {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    description: product.description || '',
    category: product.category,
    price: String(product.price),
    size: product.size,
    tone: product.tone,
    badge: product.badge || '',
    image: product.image || '',
    active: product.active !== false,
  };
}

export default function ShopAdmin({
  open,
  products,
  onClose,
  onProductsChange,
}: ShopAdminProps) {
  const { lang } = useLanguage();
  const isIs = lang === 'is';
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyImage, setBusyImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [blobConfigured, setBlobConfigured] = useState(true);

  const copy = useMemo(
    () =>
      isIs
        ? {
            title: 'Verslunarstj\u00f3ri',
            lead: 'B\u00e6ttu vi\u00f0, breyttu og fjarl\u00e6g\u00f0u v\u00f6rur. Breytingar vistast strax fyrir alla.',
            login: 'Innskr\u00e1ning',
            password: 'Lykilor\u00f0',
            signIn: 'Skr\u00e1 inn',
            signOut: '\u00datskr\u00e1',
            close: 'Loka',
            newProduct: 'N\u00fd vara',
            save: 'Vista v\u00f6ru',
            delete: 'Ey\u00f0a',
            name: 'Nafn',
            subtitle: 'Stutt l\u00fdsing',
            description: 'L\u00f6ng l\u00fdsing',
            category: 'Flokkur',
            price: 'Ver\u00f0 (kr.)',
            size: 'St\u00e6r\u00f0',
            tone: 'Litur',
            badge: 'Merki (valfrj\u00e1lst)',
            image: 'Mynd',
            imageHint: 'Hladdu upp mynd e\u00f0a limdu URL',
            active: 'S\u00fdna \u00ed verslun',
            exportJson: 'S\u00e6kja JSON',
            importJson: 'Flytja inn JSON',
            reset: 'Endurstilla sj\u00e1lfgefnar',
            wrongPassword: 'Rangt lykilor\u00f0',
            saved: 'Vara vistu\u00f0 fyrir alla',
            deleted: 'Vara fjarl\u00e6g\u00f0 fyrir alla',
            resetDone: 'Sj\u00e1lfgefnar v\u00f6rur endurstilltar fyrir alla',
            imported: 'V\u00f6rur fluttar inn fyrir alla',
            tip: '\u00c1bending: Vista\u00f0 \u00e1 vef\u00fej\u00f3ninni svo allir sj\u00e1i strax. \u00c1 Vercel \u00fearftu Blob storage.',
          }
        : {
            title: 'Shop admin',
            lead: 'Add, edit, and remove products. Changes save for everyone immediately.',
            login: 'Sign in',
            password: 'Password',
            signIn: 'Sign in',
            signOut: 'Sign out',
            close: 'Close',
            newProduct: 'New product',
            save: 'Save product',
            delete: 'Delete',
            name: 'Name',
            subtitle: 'Short description',
            description: 'Long description',
            category: 'Category',
            price: 'Price (kr.)',
            size: 'Size',
            tone: 'Color',
            badge: 'Badge (optional)',
            image: 'Image',
            imageHint: 'Upload a photo or paste an image URL',
            active: 'Show in shop',
            exportJson: 'Download JSON',
            importJson: 'Import JSON',
            reset: 'Reset to defaults',
            wrongPassword: 'Wrong password',
            saved: 'Product saved for everyone',
            deleted: 'Product deleted for everyone',
            resetDone: 'Defaults restored for everyone',
            imported: 'Products imported for everyone',
            tip: 'Tip: saved on the server so everyone sees changes immediately. On Vercel you need Blob storage.',
          },
    [isIs]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    setChecking(true);

    fetch('/api/shop/session')
      .then((res) => res.json())
      .then((data: { ok?: boolean }) => {
        if (!cancelled) {
          setAuthed(Boolean(data.ok));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthed(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setChecking(false);
        }
      });

    fetch('/api/shop/products')
      .then((res) => res.json())
      .then((data: { blobConfigured?: boolean }) => {
        if (!cancelled && typeof data.blobConfigured === 'boolean') {
          setBlobConfigured(data.blobConfigured);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError('');

    const response = await fetch('/api/shop/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setLoginError(copy.wrongPassword);
      return;
    }

    setAuthed(true);
    setPassword('');
  }

  async function handleLogout() {
    await fetch('/api/shop/logout', { method: 'POST' });
    setAuthed(false);
    setDraft(emptyDraft());
    setEditingId(null);
  }

  async function persist(next: ShopProduct[], successMessage: string) {
    setSaving(true);
    setNotice('');

    try {
      const response = await fetch('/api/shop/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: next }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        products?: ShopProduct[];
        blobConfigured?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok || !Array.isArray(data.products)) {
        throw new Error(data.error || 'save_failed');
      }

      if (typeof data.blobConfigured === 'boolean') {
        setBlobConfigured(data.blobConfigured);
      }

      saveStoredProducts(data.products);
      onProductsChange(data.products);
      setNotice(successMessage);
      return data.products;
    } catch {
      setNotice(
        isIs
          ? 'Mist\u00f3kst a\u00f0 vista \u00e1 netinu. Athuga\u00f0u Blob / innskr\u00e1ningu.'
          : 'Failed to save online. Check Blob setup / login.'
      );
      return null;
    } finally {
      setSaving(false);
    }
  }

  function startNew() {
    setEditingId(null);
    setDraft(emptyDraft());
    setNotice('');
  }

  function startEdit(product: ShopProduct) {
    setEditingId(product.id);
    setDraft(productToDraft(product));
    setNotice('');
  }

  async function onPickImage(file: File | null) {
    if (!file) {
      return;
    }

    setBusyImage(true);
    try {
      if (blobConfigured) {
        const form = new FormData();
        form.append('file', file);
        const response = await fetch('/api/shop/upload', {
          method: 'POST',
          body: form,
        });
        const data = (await response.json()) as { ok?: boolean; url?: string };
        if (response.ok && data.ok && data.url) {
          setDraft((prev) => ({ ...prev, image: data.url || '' }));
          return;
        }
      }

      const dataUrl = await resizeImageFile(file);
      setDraft((prev) => ({ ...prev, image: dataUrl }));
    } catch {
      setNotice(isIs ? 'Mist\u00f3kst a\u00f0 hla\u00f0a mynd' : 'Failed to load image');
    } finally {
      setBusyImage(false);
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();

    const price = Number(draft.price.replace(/\s/g, '').replace(',', '.'));
    if (!draft.name.trim() || !Number.isFinite(price) || price < 0) {
      setNotice(isIs ? 'Fylltu \u00fat nafn og gilt ver\u00f0' : 'Enter a name and valid price');
      return;
    }

    const nextProduct: ShopProduct = {
      id: editingId || createProductId(draft.name),
      name: draft.name.trim(),
      subtitle: draft.subtitle.trim(),
      description: draft.description.trim() || undefined,
      category: draft.category,
      price: Math.round(price),
      size: draft.size.trim() || '',
      tone: draft.tone,
      badge: draft.badge.trim() || undefined,
      image: draft.image.trim() || undefined,
      active: draft.active,
    };

    const next = editingId
      ? products.map((item) => (item.id === editingId ? nextProduct : item))
      : [nextProduct, ...products];

    const saved = await persist(next, copy.saved);
    if (!saved) {
      return;
    }

    setEditingId(nextProduct.id);
    setDraft(productToDraft(nextProduct));
  }

  async function handleDelete() {
    if (!editingId) {
      return;
    }

    const next = products.filter((item) => item.id !== editingId);
    const saved = await persist(next, copy.deleted);
    if (!saved) {
      return;
    }
    startNew();
  }

  function handleExport() {
    const blob = new Blob(
      [JSON.stringify({ products }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shop-catalog.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File | null) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as {
          products?: ShopProduct[];
        };
        if (!Array.isArray(parsed.products)) {
          throw new Error('invalid');
        }
        const saved = await persist(parsed.products, copy.imported);
        if (saved) {
          startNew();
        }
      } catch {
        setNotice(isIs ? '\u00d3gildur JSON skr\u00e1' : 'Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }

  async function handleReset() {
    const defaults = cloneDefaultProducts();
    const saved = await persist(defaults, copy.resetDone);
    if (saved) {
      clearStoredProducts();
      startNew();
    }
  }

  return (
    <div className="shop-admin-overlay" role="dialog" aria-modal="true">
      <div className="shop-admin-panel">
        <div className="shop-admin-head">
          <div>
            <p className="eyebrow">{copy.title}</p>
            <h2>{authed ? copy.title : copy.login}</h2>
            <p>{copy.lead}</p>
          </div>
          <button type="button" className="shop-admin-close" onClick={onClose}>
            {copy.close}
          </button>
        </div>

        {checking ? (
          <p className="shop-admin-note"></p>
        ) : !authed ? (
          <form className="shop-admin-login" onSubmit={handleLogin}>
            <label>
              <span>{copy.password}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {loginError ? <p className="shop-admin-error">{loginError}</p> : null}
            <button type="submit" className="btn-primary">
              {copy.signIn}
            </button>
          </form>
        ) : (
          <div className="shop-admin-body">
            <div className="shop-admin-toolbar">
              <button type="button" onClick={startNew}>
                {copy.newProduct}
              </button>
              <button type="button" onClick={handleExport}>
                {copy.exportJson}
              </button>
              <label className="shop-admin-file">
                {copy.importJson}
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) =>
                    handleImport(event.target.files?.[0] || null)
                  }
                />
              </label>
              <button type="button" onClick={handleReset}>
                {copy.reset}
              </button>
              <button type="button" onClick={handleLogout}>
                {copy.signOut}
              </button>
            </div>

            <p className="shop-admin-tip">{copy.tip}</p>
            {!blobConfigured ? (
              <p className="shop-admin-error">
                {isIs
                  ? 'Vercel Blob er ekki tengt. Vista virkar lokalt, en ekki fyrir alla \u00e1 netinu fyrr en Blob er sett upp.'
                  : 'Vercel Blob is not connected. Saves work locally, but not for everyone online until Blob is set up.'}
              </p>
            ) : null}
            {notice ? <p className="shop-admin-note">{notice}</p> : null}

            <div className="shop-admin-grid">
              <div className="shop-admin-list">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className={
                      'shop-admin-list-item' +
                      (editingId === product.id ? ' active' : '') +
                      (product.active === false ? ' muted' : '')
                    }
                    onClick={() => startEdit(product)}
                  >
                    <span>
                      {product.image ? (
                        <img src={product.image} alt="" />
                      ) : (
                        <span className="shop-admin-thumb-fallback" />
                      )}
                    </span>
                    <div>
                      <strong>{product.name}</strong>
                      <small>
                        {product.price.toLocaleString('is-IS')} kr.  {product.size}
                      </small>
                    </div>
                  </button>
                ))}
              </div>

              <form className="shop-admin-form" onSubmit={handleSave}>
                <label>
                  <span>{copy.name}</span>
                  <input
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, name: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>{copy.subtitle}</span>
                  <input
                    value={draft.subtitle}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        subtitle: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>{copy.description}</span>
                  <textarea
                    rows={3}
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="shop-admin-row">
                  <label>
                    <span>{copy.category}</span>
                    <select
                      value={draft.category}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          category: event.target
                            .value as Draft['category'],
                        }))
                      }
                    >
                      {shopProductCategories.map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{copy.price}</span>
                    <input
                      value={draft.price}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          price: event.target.value,
                        }))
                      }
                      inputMode="numeric"
                      required
                    />
                  </label>
                </div>
                <div className="shop-admin-row">
                  <label>
                    <span>{copy.size}</span>
                    <input
                      value={draft.size}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          size: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    <span>{copy.tone}</span>
                    <select
                      value={draft.tone}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          tone: event.target.value as ShopProductTone,
                        }))
                      }
                    >
                      {shopTones.map((tone) => (
                        <option key={tone} value={tone}>
                          {tone}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  <span>{copy.badge}</span>
                  <input
                    value={draft.badge}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        badge: event.target.value,
                      }))
                    }
                    placeholder="POPULAR / TOP"
                  />
                </label>
                <label>
                  <span>{copy.image}</span>
                  <input
                    value={draft.image.startsWith('data:') ? '' : draft.image}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        image: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </label>
                <label className="shop-admin-file">
                  {busyImage
                    ? ''
                    : copy.imageHint}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      onPickImage(event.target.files?.[0] || null)
                    }
                  />
                </label>
                {draft.image ? (
                  <div className="shop-admin-preview">
                    <img src={draft.image} alt="" />
                  </div>
                ) : null}
                <label className="shop-admin-check">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        active: event.target.checked,
                      }))
                    }
                  />
                  <span>{copy.active}</span>
                </label>
                <div className="shop-admin-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? '...' : copy.save}
                  </button>
                  {editingId ? (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={handleDelete}
                      disabled={saving}
                    >
                      {copy.delete}
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
