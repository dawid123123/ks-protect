'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../lib/i18n/context';
import {
  createProductId,
  resizeImageFile,
  saveStoredCatalog,
  clearStoredProducts,
  cloneDefaultProducts,
  cloneDefaultCategories,
} from '../lib/shopStorage';
import {
  MAX_PRODUCT_CATEGORIES,
  ShopCategoryDef,
  ShopProduct,
  ShopProductTone,
  categoryLabel,
  createCategoryId,
  getProductCategories,
  getSalePercent,
  priceFromDiscount,
  productHasCategory,
} from './shopData';

type ShopAdminProps = {
  open: boolean;
  products: ShopProduct[];
  categories: ShopCategoryDef[];
  onClose: () => void;
  onCatalogChange: (
    products: ShopProduct[],
    categories: ShopCategoryDef[]
  ) => void;
};

type Draft = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  selectedCategories: string[];
  price: string;
  compareAtPrice: string;
  discountPercent: string;
  saleEnabled: boolean;
  size: string;
  tone: ShopProductTone;
  badge: string;
  image: string;
  active: boolean;
};

const emptyDraft = (defaultCategory = 'thvottur'): Draft => ({
  id: '',
  name: '',
  subtitle: '',
  description: '',
  selectedCategories: defaultCategory ? [defaultCategory] : [],
  price: '',
  compareAtPrice: '',
  discountPercent: '',
  saleEnabled: false,
  size: '',
  tone: 'green',
  badge: '',
  image: '',
  active: true,
});

function parseKr(value: string) {
  const n = Number(value.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

function productToDraft(product: ShopProduct): Draft {
  const compareAt = product.compareAtPrice;
  const saleEnabled = Boolean(compareAt && compareAt > product.price);
  return {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    description: product.description || '',
    selectedCategories: getProductCategories(product),
    price: String(product.price),
    compareAtPrice: saleEnabled ? String(compareAt) : '',
    discountPercent: saleEnabled ? String(getSalePercent(product)) : '',
    saleEnabled,
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
  categories,
  onClose,
  onCatalogChange,
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
  const [query, setQuery] = useState('');
  const [showTools, setShowTools] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loginView, setLoginView] = useState<'login' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState<'request' | 'confirm'>('request');
  const [forgotPin, setForgotPin] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNext, setForgotNext] = useState('');
  const [forgotNext2, setForgotNext2] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwCode, setPwCode] = useState('');
  const [pwNext, setPwNext] = useState('');
  const [pwNext2, setPwNext2] = useState('');
  const [pwStep, setPwStep] = useState<'request' | 'confirm'>('request');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [localCategories, setLocalCategories] = useState<ShopCategoryDef[]>(categories);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const copy = useMemo(
    () =>
      isIs
        ? {
            title: 'Verslunarstj\u00f3ri',
            lead: 'Breyttu v\u00f6rum, ver\u00f0i og tilbo\u00f0um. Vista\u00f0 strax.',
            login: 'Innskr\u00e1ning',
            password: 'Lykilor\u00f0',
            signIn: 'Skr\u00e1 inn',
            signOut: '\u00datskr\u00e1',
            close: 'Loka',
            newProduct: '+ N\u00fd vara',
            save: 'Vista',
            delete: 'Ey\u00f0a',
            search: 'Leita a\u00f0 v\u00f6ru...',
            sectionBasic: 'Vara',
            sectionPrice: 'Ver\u00f0 og tilbo\u00f0',
            sectionMedia: 'Mynd',
            name: 'Nafn',
            subtitle: 'Stutt l\u00fdsing',
            description: 'L\u00f6ng l\u00fdsing',
            category: 'Flokkur',
            sectionCategories: 'Flokkar',
            categoriesHint: 'Smelltu \u00e1 flokk (max 2).',
            addCategory: 'B\u00e6ta vi\u00f0 flokki',
            categoryName: 'Nafn flokks',
            categoryNamePlaceholder: 't.d. GLERHREINSIR',
            removeCategory: 'Ey\u00f0a',
            categoryInUse: 'Flokkur \u00ed notkun',
            categoryMax: 'Mest 2 flokkar',
            price: 'S\u00f6luver\u00f0 (kr.)',
            compareAt: 'Ver\u00f0 \u00e1\u00f0ur (kr.)',
            discount: 'Afsl\u00e1ttur %',
            saleToggle: 'Virkja tilbo\u00f0 / afsl\u00e1tt',
            saleHint:
              'Settu \u201ever\u00f0 \u00e1\u00f0ur\u201c og % \u2014 s\u00f6luver\u00f0 reiknast sj\u00e1lfkrafa.',
            size: 'St\u00e6r\u00f0',
            tone: 'Litur \u00e1 spjaldi',
            badge: 'Merki',
            badgePlaceholder: 't.d. VINS\u00c6LT / TOP',
            image: 'Mynd URL',
            imageHint: 'Hla\u00f0a upp mynd',
            active: 'S\u00fdna \u00ed verslun',
            tools: 'JSON / afrit',
            exportJson: 'S\u00e6kja JSON',
            importJson: 'Flytja inn JSON',
            reset: 'Endurstilla',
            wrongPassword: 'Rangt lykilor\u00f0',
            forgotPassword: 'Gleymt lykilor\u00f0i?',
            forgotTitle: 'Endurstilla lykilor\u00f0',
            forgotLead:
              'Sláðu inn öryggis-PIN til að fá staðfestingarkóða á netfang KS Protect. Síðan seturðu nýtt lykilorð.',
            recoveryPin: 'Öryggis-PIN',
            wrongPin: 'Rangur PIN',
            sendResetCode: 'Senda kóða í tölvupóst',
            resetCodeSent: 'Kóði sendur',
            resetPassword: 'Vista nýtt lykilorð',
            backToLogin: 'Til baka í innskráningu',
            tooSoon: 'Bíddu aðeins — reyndu aftur eftir smá stund',
            otpInvalid: 'Rangur eða útrunninn kóði',
            changePassword: 'Breyta lykilorði',
            currentPassword: 'Núverandi lykilorð',
            newPassword: 'Nýtt lykilorð',
            confirmPassword: 'Staðfesta nýtt lykilorð',
            sendCode: 'Senda kóða í tölvupóst',
            codeSent: 'Kóði sendur á netfang KS Protect',
            otpCode: 'Staðfestingarkóði',
            savePassword: 'Vista nýtt lykilorð',
            passwordChanged: 'Lykilorði breytt — skráðu þig inn aftur',
            passwordMismatch: 'Nýju lykilorðin passa ekki',
            passwordWeak: 'Lykilorð þarf að vera a.m.k. 8 stafir',
            passwordMailFailed: 'Gat ekki sent kóða — athugaðu RESEND_API_KEY',
            saved: 'Vista\u00f0',
            deleted: 'Vara fjarl\u00e6g\u00f0',
            resetDone: 'Sj\u00e1lfgefnar v\u00f6rur endurstilltar',
            imported: 'V\u00f6rur fluttar inn',
            tip: 'Vista\u00f0 \u00e1 vef\u00fej\u00f3ninni. \u00c1 Vercel \u00fearftu Blob.',
            previewSale: 'Forsko\u00f0un',
            emptyList: 'Engin vara fundin',
            pickProduct: 'Veldu v\u00f6ru til vinstri e\u00f0a b\u00fa\u00f0u til n\u00fda.',
            allCategories: 'ALLT',
            productCount: 'v\u00f6rur',
            hidden: 'Falin',
          }
        : {
            title: 'Shop admin',
            lead: 'Edit products, prices and sales. Saves immediately.',
            login: 'Sign in',
            password: 'Password',
            signIn: 'Sign in',
            signOut: 'Sign out',
            close: 'Close',
            newProduct: '+ New product',
            save: 'Save',
            delete: 'Delete',
            search: 'Search products...',
            sectionBasic: 'Product',
            sectionPrice: 'Price & sale',
            sectionMedia: 'Image',
            name: 'Name',
            subtitle: 'Short description',
            description: 'Long description',
            category: 'Category',
            sectionCategories: 'Categories',
            categoriesHint: 'Click a category (max 2).',
            addCategory: 'Add category',
            categoryName: 'Category name',
            categoryNamePlaceholder: 'e.g. GLASS CARE',
            removeCategory: 'Remove',
            categoryInUse: 'Category in use',
            categoryMax: 'Max 2 categories',
            price: 'Sale price (kr.)',
            compareAt: 'Was price (kr.)',
            discount: 'Discount %',
            saleToggle: 'Enable sale / discount',
            saleHint:
              'Set “was price” and % — sale price updates automatically.',
            size: 'Size',
            tone: 'Card color',
            badge: 'Badge',
            badgePlaceholder: 'e.g. POPULAR / TOP',
            image: 'Image URL',
            imageHint: 'Upload image',
            active: 'Show in shop',
            tools: 'JSON / backup',
            exportJson: 'Download JSON',
            importJson: 'Import JSON',
            reset: 'Reset defaults',
            wrongPassword: 'Wrong password',
            forgotPassword: 'Forgot password?',
            forgotTitle: 'Reset password',
            forgotLead:
              'Enter the security PIN to get a confirmation code on the KS Protect email. Then set a new password.',
            recoveryPin: 'Security PIN',
            wrongPin: 'Wrong PIN',
            sendResetCode: 'Send email code',
            resetCodeSent: 'Code sent',
            resetPassword: 'Save new password',
            backToLogin: 'Back to sign in',
            tooSoon: 'Wait a moment — try again shortly',
            otpInvalid: 'Invalid or expired code',
            changePassword: 'Change password',
            currentPassword: 'Current password',
            newPassword: 'New password',
            confirmPassword: 'Confirm new password',
            sendCode: 'Send email code',
            codeSent: 'Code sent to KS Protect email',
            otpCode: 'Confirmation code',
            savePassword: 'Save new password',
            passwordChanged: 'Password changed — sign in again',
            passwordMismatch: 'New passwords do not match',
            passwordWeak: 'Password must be at least 8 characters',
            passwordMailFailed: 'Could not send code — check RESEND_API_KEY',
            saved: 'Saved',
            deleted: 'Product deleted',
            resetDone: 'Defaults restored',
            imported: 'Products imported',
            tip: 'Saved on the server. On Vercel you need Blob.',
            previewSale: 'Preview',
            emptyList: 'No products found',
            pickProduct: 'Pick a product on the left or create a new one.',
            allCategories: 'ALL',
            productCount: 'products',
            hidden: 'Hidden',
          },
    [isIs]
  );

  const [listCategory, setListCategory] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (listCategory !== 'all' && !productHasCategory(p, listCategory)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const cats = getProductCategories(p).join(' ');
      return (
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        cats.includes(q)
      );
    });
  }, [products, query, listCategory]);

  const groupedProducts = useMemo(() => {
    const order = localCategories.map((c) => c.id);
    const groups: { id: string; label: string; items: ShopProduct[] }[] = [];
    const placed = new Set<string>();

    order.forEach((id) => {
      const items = filteredProducts.filter((p) => productHasCategory(p, id));
      if (!items.length) {
        return;
      }
      const def = localCategories.find((c) => c.id === id);
      groups.push({
        id,
        label: categoryLabel(def, lang, id),
        items,
      });
      items.forEach((p) => placed.add(p.id));
    });

    const leftovers = filteredProducts.filter((p) => !placed.has(p.id));
    if (leftovers.length) {
      groups.push({
        id: 'other',
        label: lang === 'en' ? 'OTHER' : 'ANNAÐ',
        items: leftovers,
      });
    }

    return groups;
  }, [filteredProducts, localCategories, lang]);

  const salePreview = useMemo(() => {
    if (!draft.saleEnabled) {
      return null;
    }
    const compare = parseKr(draft.compareAtPrice);
    const price = parseKr(draft.price);
    if (!Number.isFinite(compare) || !Number.isFinite(price) || compare <= price) {
      return null;
    }
    return {
      compare: Math.round(compare),
      price: Math.round(price),
      percent: getSalePercent({ price, compareAtPrice: compare }),
    };
  }, [draft]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    // Always require password for this session of the panel.
    setAuthed(false);
    setPassword('');
    setLoginError('');
    setChecking(false);

    fetch('/api/shop/logout', { method: 'POST' }).catch(() => undefined);

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

  async function handleClose() {
    await fetch('/api/shop/logout', { method: 'POST' }).catch(() => undefined);
    setAuthed(false);
    setPassword('');
    setLoginError('');
    setNotice('');
    setDraft(emptyDraft());
    setEditingId(null);
    setLoginView('login');
    setForgotStep('request');
    setForgotPin('');
    setForgotCode('');
    setForgotNext('');
    setForgotNext2('');
    setForgotMessage('');
    setForgotError('');
    onClose();
  }

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

  function resetForgotState() {
    setLoginView('login');
    setForgotStep('request');
    setForgotPin('');
    setForgotCode('');
    setForgotNext('');
    setForgotNext2('');
    setForgotMessage('');
    setForgotError('');
  }

  async function handleLogout() {
    await fetch('/api/shop/logout', { method: 'POST' });
    setAuthed(false);
    setDraft(emptyDraft());
    setEditingId(null);
    setShowPasswordChange(false);
    setPwStep('request');
    setPwCurrent('');
    setPwCode('');
    setPwNext('');
    setPwNext2('');
    setPwMessage('');
    setPwError('');
    resetForgotState();
  }

  async function requestForgotCode(event: FormEvent) {
    event.preventDefault();
    setForgotBusy(true);
    setForgotError('');
    setForgotMessage('');
    try {
      const response = await fetch('/api/shop/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: forgotPin }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        sentToHint?: string;
      };
      if (!response.ok || !data.ok) {
        setForgotError(
          data.error === 'wrong_pin'
            ? copy.wrongPin
            : data.error === 'too_soon'
              ? copy.tooSoon
              : copy.passwordMailFailed
        );
        return;
      }
      setForgotMessage(
        data.sentToHint
          ? `${copy.resetCodeSent}: ${data.sentToHint}`
          : copy.resetCodeSent
      );
      setForgotStep('confirm');
    } catch {
      setForgotError(copy.passwordMailFailed);
    } finally {
      setForgotBusy(false);
    }
  }

  async function confirmForgotReset(event: FormEvent) {
    event.preventDefault();
    setForgotBusy(true);
    setForgotError('');

    if (forgotNext !== forgotNext2) {
      setForgotError(copy.passwordMismatch);
      setForgotBusy(false);
      return;
    }
    if (forgotNext.length < 8) {
      setForgotError(copy.passwordWeak);
      setForgotBusy(false);
      return;
    }

    try {
      const response = await fetch('/api/shop/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: forgotPin,
          code: forgotCode,
          newPassword: forgotNext,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        const map: Record<string, string> = {
          wrong_pin: copy.wrongPin,
          weak_password: copy.passwordWeak,
          otp_invalid: copy.otpInvalid,
          otp_expired: copy.otpInvalid,
          otp_missing: copy.otpInvalid,
        };
        setForgotError(map[data.error || ''] || copy.otpInvalid);
        return;
      }

      resetForgotState();
      setLoginError('');
      setNotice(copy.passwordChanged);
    } catch {
      setForgotError(copy.otpInvalid);
    } finally {
      setForgotBusy(false);
    }
  }

  async function requestPasswordCode(event: FormEvent) {
    event.preventDefault();
    setPwBusy(true);
    setPwError('');
    setPwMessage('');
    try {
      const response = await fetch('/api/shop/password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwCurrent }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        setPwError(
          data.error === 'wrong_password'
            ? copy.wrongPassword
            : data.error === 'mail_not_configured'
              ? copy.passwordMailFailed
              : copy.passwordMailFailed
        );
        return;
      }
      setPwMessage(copy.codeSent);
      setPwStep('confirm');
    } catch {
      setPwError(copy.passwordMailFailed);
    } finally {
      setPwBusy(false);
    }
  }

  async function confirmPasswordChange(event: FormEvent) {
    event.preventDefault();
    setPwBusy(true);
    setPwError('');
    setPwMessage('');

    if (pwNext !== pwNext2) {
      setPwError(copy.passwordMismatch);
      setPwBusy(false);
      return;
    }
    if (pwNext.length < 8) {
      setPwError(copy.passwordWeak);
      setPwBusy(false);
      return;
    }

    try {
      const response = await fetch('/api/shop/password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwCurrent,
          code: pwCode,
          newPassword: pwNext,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        const map: Record<string, string> = {
          wrong_password: copy.wrongPassword,
          weak_password: copy.passwordWeak,
          otp_invalid: copy.wrongPassword,
          otp_expired: copy.wrongPassword,
          otp_missing: copy.wrongPassword,
        };
        setPwError(map[data.error || ''] || copy.passwordMailFailed);
        return;
      }

      setAuthed(false);
      setShowPasswordChange(false);
      setPwStep('request');
      setPwCurrent('');
      setPwCode('');
      setPwNext('');
      setPwNext2('');
      setNotice(copy.passwordChanged);
    } catch {
      setPwError(copy.passwordMailFailed);
    } finally {
      setPwBusy(false);
    }
  }

  async function persist(
    nextProducts: ShopProduct[],
    nextCategories: ShopCategoryDef[],
    successMessage: string
  ) {
    setSaving(true);
    setNotice('');

    try {
      const response = await fetch('/api/shop/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: nextProducts,
          categories: nextCategories,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        products?: ShopProduct[];
        categories?: ShopCategoryDef[];
        blobConfigured?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok || !Array.isArray(data.products)) {
        throw new Error(data.error || 'save_failed');
      }

      if (typeof data.blobConfigured === 'boolean') {
        setBlobConfigured(data.blobConfigured);
      }

      const cats = data.categories || nextCategories;
      saveStoredCatalog(data.products, cats);
      setLocalCategories(cats);
      onCatalogChange(data.products, cats);
      setNotice(successMessage);
      return { products: data.products, categories: cats };
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

  async function addCategory() {
    const label = newCategoryLabel.trim().toUpperCase();
    if (!label) {
      return;
    }
    const id = createCategoryId(label);
    if (localCategories.some((c) => c.id === id || c.labelIs === label)) {
      setNotice(isIs ? 'Flokkur er \u00fear \u00fear' : 'Category already exists');
      return;
    }
    const next = [
      ...localCategories,
      { id, labelIs: label, labelEn: label },
    ];
    const saved = await persist(products, next, copy.saved);
    if (saved) {
      setNewCategoryLabel('');
      setDraft((prev) => ({
        ...prev,
        selectedCategories:
          prev.selectedCategories.length >= MAX_PRODUCT_CATEGORIES
            ? prev.selectedCategories
            : [...prev.selectedCategories, id],
      }));
    }
  }

  async function removeCategory(id: string) {
    if (products.some((p) => productHasCategory(p, id))) {
      setNotice(copy.categoryInUse);
      return;
    }
    const next = localCategories.filter((c) => c.id !== id);
    await persist(products, next, copy.saved);
  }

  function toggleProductCategory(id: string) {
    setDraft((prev) => {
      const selected = prev.selectedCategories;
      if (selected.includes(id)) {
        return {
          ...prev,
          selectedCategories: selected.filter((item) => item !== id),
        };
      }
      if (selected.length >= MAX_PRODUCT_CATEGORIES) {
        setNotice(copy.categoryMax);
        return prev;
      }
      return {
        ...prev,
        selectedCategories: [...selected, id],
      };
    });
  }

  function startNew() {
    setEditingId(null);
    setDraft(emptyDraft(localCategories[0]?.id || 'thvottur'));
    setNotice('');
  }

  function startEdit(product: ShopProduct) {
    setEditingId(product.id);
    setDraft(productToDraft(product));
    setNotice('');
  }

  function setSaleEnabled(enabled: boolean) {
    setDraft((prev) => {
      if (!enabled) {
        return {
          ...prev,
          saleEnabled: false,
          compareAtPrice: '',
          discountPercent: '',
        };
      }
      const price = parseKr(prev.price);
      const seedCompare =
        Number.isFinite(price) && price > 0 ? String(Math.round(price)) : '';
      return {
        ...prev,
        saleEnabled: true,
        compareAtPrice: prev.compareAtPrice || seedCompare,
        discountPercent: prev.discountPercent || '10',
        price:
          prev.compareAtPrice || seedCompare
            ? String(
                priceFromDiscount(
                  parseKr(prev.compareAtPrice || seedCompare),
                  parseKr(prev.discountPercent || '10') || 10
                )
              )
            : prev.price,
      };
    });
  }

  function updateCompareAt(value: string) {
    setDraft((prev) => {
      const compare = parseKr(value);
      const percent = parseKr(prev.discountPercent);
      if (
        prev.saleEnabled &&
        Number.isFinite(compare) &&
        compare > 0 &&
        Number.isFinite(percent)
      ) {
        return {
          ...prev,
          compareAtPrice: value,
          price: String(priceFromDiscount(compare, percent)),
        };
      }
      return { ...prev, compareAtPrice: value };
    });
  }

  function updateDiscountPercent(value: string) {
    setDraft((prev) => {
      const compare = parseKr(prev.compareAtPrice);
      const percent = parseKr(value);
      if (
        prev.saleEnabled &&
        Number.isFinite(compare) &&
        compare > 0 &&
        Number.isFinite(percent)
      ) {
        return {
          ...prev,
          discountPercent: value,
          price: String(priceFromDiscount(compare, percent)),
        };
      }
      return { ...prev, discountPercent: value };
    });
  }

  function updateSalePrice(value: string) {
    setDraft((prev) => {
      const price = parseKr(value);
      const compare = parseKr(prev.compareAtPrice);
      if (
        prev.saleEnabled &&
        Number.isFinite(price) &&
        Number.isFinite(compare) &&
        compare > price
      ) {
        return {
          ...prev,
          price: value,
          discountPercent: String(
            getSalePercent({ price, compareAtPrice: compare })
          ),
        };
      }
      return { ...prev, price: value };
    });
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

    const price = parseKr(draft.price);
    if (!draft.name.trim() || !Number.isFinite(price) || price < 0) {
      setNotice(isIs ? 'Fylltu \u00fat nafn og gilt ver\u00f0' : 'Enter a name and valid price');
      return;
    }

    let compareAtPrice: number | undefined;
    if (draft.saleEnabled) {
      const compare = parseKr(draft.compareAtPrice);
      if (!Number.isFinite(compare) || compare <= price) {
        setNotice(
          isIs
            ? 'Ver\u00f0 \u00e1\u00f0ur \u00fearf a\u00f0 vera h\u00e6rra en s\u00f6luver\u00f0'
            : '“Was price” must be higher than sale price'
        );
        return;
      }
      compareAtPrice = Math.round(compare);
    }

    const selected = draft.selectedCategories.slice(0, MAX_PRODUCT_CATEGORIES);
    if (!selected.length) {
      setNotice(
        isIs ? 'Veldu a.m.k. einn flokk' : 'Select at least one category'
      );
      return;
    }

    const nextProduct: ShopProduct = {
      id: editingId || createProductId(draft.name),
      name: draft.name.trim(),
      subtitle: draft.subtitle.trim(),
      description: draft.description.trim() || undefined,
      category: selected[0],
      categories: selected,
      price: Math.round(price),
      compareAtPrice,
      size: draft.size.trim() || '',
      tone: draft.tone,
      badge: draft.badge.trim() || undefined,
      image: draft.image.trim() || undefined,
      active: draft.active,
    };

    const next = editingId
      ? products.map((item) => (item.id === editingId ? nextProduct : item))
      : [nextProduct, ...products];

    const saved = await persist(next, localCategories, copy.saved);
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
    const saved = await persist(next, localCategories, copy.deleted);
    if (!saved) {
      return;
    }
    startNew();
  }

  function handleExport() {
    const blob = new Blob(
      [JSON.stringify({ products, categories: localCategories }, null, 2)],
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
          categories?: ShopCategoryDef[];
        };
        if (!Array.isArray(parsed.products)) {
          throw new Error('invalid');
        }
        const saved = await persist(
          parsed.products,
          parsed.categories || localCategories,
          copy.imported
        );
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
    const defaultCats = cloneDefaultCategories();
    const saved = await persist(defaults, defaultCats, copy.resetDone);
    if (saved) {
      clearStoredProducts();
      startNew();
    }
  }

  return (
    <div className="shop-admin-overlay" role="dialog" aria-modal="true">
      <div className="shop-admin-panel shop-admin-panel-v2">
        <button
          type="button"
          className="shop-admin-close shop-admin-close-top"
          onClick={() => {
            void handleClose();
          }}
        >
          {copy.close}
        </button>

        {checking ? (
          <p className="shop-admin-note"></p>
        ) : !authed ? (
          <div className="shop-admin-login-wrap">
            <div className="shop-admin-head">
              <div>
                <p className="eyebrow">{copy.title}</p>
                <h2>{loginView === 'login' ? copy.login : copy.forgotTitle}</h2>
                <p>{loginView === 'login' ? copy.lead : copy.forgotLead}</p>
              </div>
            </div>
            {loginView === 'login' ? (
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
                {notice ? <p className="shop-admin-note">{notice}</p> : null}
                <button type="submit" className="btn-primary">
                  {copy.signIn}
                </button>
                <button
                  type="button"
                  className="shop-admin-forgot-link"
                  onClick={() => {
                    setLoginView('forgot');
                    setForgotStep('request');
                    setForgotError('');
                    setForgotMessage('');
                    setLoginError('');
                    setNotice('');
                  }}
                >
                  {copy.forgotPassword}
                </button>
              </form>
            ) : (
              <div className="shop-admin-login shop-admin-forgot">
                {forgotStep === 'request' ? (
                  <form onSubmit={requestForgotCode}>
                    <p className="shop-admin-note">{copy.forgotLead}</p>
                    <label>
                      <span>{copy.recoveryPin}</span>
                      <input
                        type="password"
                        inputMode="numeric"
                        value={forgotPin}
                        onChange={(e) => setForgotPin(e.target.value)}
                        required
                        autoComplete="off"
                      />
                    </label>
                    {forgotError ? (
                      <p className="shop-admin-error">{forgotError}</p>
                    ) : null}
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={forgotBusy}
                    >
                      {copy.sendResetCode}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={confirmForgotReset}>
                    <p className="shop-admin-note">
                      {forgotMessage || copy.resetCodeSent}
                    </p>
                    <label>
                      <span>{copy.otpCode}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={forgotCode}
                        onChange={(e) => setForgotCode(e.target.value)}
                        required
                        autoComplete="one-time-code"
                      />
                    </label>
                    <label>
                      <span>{copy.newPassword}</span>
                      <input
                        type="password"
                        value={forgotNext}
                        onChange={(e) => setForgotNext(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </label>
                    <label>
                      <span>{copy.confirmPassword}</span>
                      <input
                        type="password"
                        value={forgotNext2}
                        onChange={(e) => setForgotNext2(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </label>
                    {forgotError ? (
                      <p className="shop-admin-error">{forgotError}</p>
                    ) : null}
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={forgotBusy}
                    >
                      {copy.resetPassword}
                    </button>
                  </form>
                )}
                <button
                  type="button"
                  className="shop-admin-forgot-link"
                  onClick={() => {
                    resetForgotState();
                    setNotice('');
                  }}
                >
                  {copy.backToLogin}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="shop-admin-body">
            <div className="shop-admin-grid">
              <div className="shop-admin-sidebar">
                <div className="shop-admin-sidebar-top">
                  <div className="shop-admin-list-meta">
                    <strong>
                      {filteredProducts.length} {copy.productCount}
                    </strong>
                  </div>
                  <input
                    className="shop-admin-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={copy.search}
                  />
                  <div className="shop-admin-filter-chips">
                    <button
                      type="button"
                      className={listCategory === 'all' ? 'active' : ''}
                      onClick={() => setListCategory('all')}
                    >
                      {copy.allCategories}
                    </button>
                    {localCategories.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={listCategory === item.id ? 'active' : ''}
                        onClick={() => setListCategory(item.id)}
                      >
                        {categoryLabel(item, lang)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="shop-admin-list">
                  {groupedProducts.length === 0 ? (
                    <p className="shop-admin-empty">{copy.emptyList}</p>
                  ) : (
                    groupedProducts.map((group) => (
                      <div className="shop-admin-group" key={group.id}>
                        <div className="shop-admin-group-head">
                          <span>{group.label}</span>
                          <em>{group.items.length}</em>
                        </div>
                        <div className="shop-admin-group-items">
                          {group.items.map((product) => {
                            const percent = getSalePercent(product);
                            return (
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
                                    {percent > 0 ? (
                                      <>
                                        <s>
                                          {product.compareAtPrice?.toLocaleString(
                                            'is-IS'
                                          )}{' '}
                                          kr.
                                        </s>{' '}
                                        <b>
                                          {product.price.toLocaleString('is-IS')}{' '}
                                          kr.
                                        </b>
                                        <span className="shop-admin-sale-pill">
                                          -{percent}%
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        {product.price.toLocaleString('is-IS')} kr.
                                        {product.size
                                          ? ' · ' + product.size
                                          : ''}
                                      </>
                                    )}
                                    {product.active === false ? (
                                      <span className="shop-admin-hidden-pill">
                                        {copy.hidden}
                                      </span>
                                    ) : null}
                                  </small>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form className="shop-admin-form" onSubmit={handleSave}>
                {!editingId && !draft.name ? (
                  <p className="shop-admin-pick">{copy.pickProduct}</p>
                ) : null}

                <div className="shop-admin-section">
                  <p className="shop-admin-section-title">{copy.sectionBasic}</p>
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
                </div>

                <div className="shop-admin-section">
                  <p className="shop-admin-section-title">
                    {copy.sectionCategories}
                  </p>
                  <p className="shop-admin-field-hint">{copy.categoriesHint}</p>
                  <div className="shop-admin-category-list">
                    {localCategories.map((item) => {
                      const selected = draft.selectedCategories.includes(item.id);
                      const inUse = products.some((p) =>
                        productHasCategory(p, item.id)
                      );
                      return (
                        <div
                          className={
                            'shop-admin-category-chip' +
                            (selected ? ' selected' : '')
                          }
                          key={item.id}
                        >
                          <button
                            type="button"
                            className="shop-admin-category-pick"
                            onClick={() => toggleProductCategory(item.id)}
                          >
                            {categoryLabel(item, lang)}
                          </button>
                          <button
                            type="button"
                            className="shop-admin-category-delete"
                            disabled={inUse || saving}
                            title={
                              inUse ? copy.categoryInUse : copy.removeCategory
                            }
                            onClick={() => removeCategory(item.id)}
                          >
                            {copy.removeCategory}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="shop-admin-category-add">
                    <label>
                      <span>{copy.categoryName}</span>
                      <input
                        value={newCategoryLabel}
                        onChange={(event) =>
                          setNewCategoryLabel(event.target.value)
                        }
                        placeholder={copy.categoryNamePlaceholder}
                      />
                    </label>
                    <button
                      type="button"
                      className="shop-admin-primary-btn"
                      disabled={saving || !newCategoryLabel.trim()}
                      onClick={addCategory}
                    >
                      {copy.addCategory}
                    </button>
                  </div>
                </div>

                <div className="shop-admin-section">
                  <p className="shop-admin-section-title">{copy.sectionPrice}</p>

                  <label className="shop-admin-check">
                    <input
                      type="checkbox"
                      checked={draft.saleEnabled}
                      onChange={(event) => setSaleEnabled(event.target.checked)}
                    />
                    <span>{copy.saleToggle}</span>
                  </label>
                  <p className="shop-admin-field-hint">{copy.saleHint}</p>

                  {draft.saleEnabled ? (
                    <div className="shop-admin-row shop-admin-row-3">
                      <label>
                        <span>{copy.compareAt}</span>
                        <input
                          value={draft.compareAtPrice}
                          onChange={(event) => updateCompareAt(event.target.value)}
                          inputMode="numeric"
                          placeholder="3990"
                        />
                      </label>
                      <label>
                        <span>{copy.discount}</span>
                        <input
                          value={draft.discountPercent}
                          onChange={(event) =>
                            updateDiscountPercent(event.target.value)
                          }
                          inputMode="numeric"
                          placeholder="20"
                        />
                      </label>
                      <label>
                        <span>{copy.price}</span>
                        <input
                          value={draft.price}
                          onChange={(event) => updateSalePrice(event.target.value)}
                          inputMode="numeric"
                          required
                        />
                      </label>
                    </div>
                  ) : (
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
                  )}

                  {salePreview ? (
                    <div className="shop-admin-sale-preview">
                      <span>{copy.previewSale}</span>
                      <strong>
                        <s>{salePreview.compare.toLocaleString('is-IS')} kr.</s>
                        <b>{salePreview.price.toLocaleString('is-IS')} kr.</b>
                        <em>-{salePreview.percent}%</em>
                      </strong>
                    </div>
                  ) : null}

                </div>

                <div className="shop-admin-section">
                  <p className="shop-admin-section-title">{copy.sectionMedia}</p>
                  <label className="shop-admin-file shop-admin-upload">
                    {busyImage ? '...' : copy.imageHint}
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
                </div>

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

            <footer className="shop-admin-footer">
              <div className="shop-admin-footer-brand">
                <strong>{copy.title}</strong>
                <span>{copy.lead}</span>
              </div>
              <div className="shop-admin-footer-actions">
                <span
                  className={
                    'shop-admin-vb' + (blobConfigured ? ' ok' : ' off')
                  }
                  title={blobConfigured ? 'Vercel Blob' : 'Vercel Blob offline'}
                >
                  VB {blobConfigured ? '✓' : '✗'}
                </span>
                {notice ? <span className="shop-admin-note">{notice}</span> : null}
                <button
                  type="button"
                  className="shop-admin-primary-btn"
                  onClick={startNew}
                >
                  {copy.newProduct}
                </button>
                <button type="button" onClick={() => setShowTools((v) => !v)}>
                  {copy.tools}
                </button>
                <button type="button" onClick={() => setShowPasswordChange((v) => !v)}>
                  {copy.changePassword}
                </button>
                <button type="button" onClick={handleLogout}>
                  {copy.signOut}
                </button>
              </div>
              {showPasswordChange ? (
                <div className="shop-admin-password-box">
                  {pwStep === 'request' ? (
                    <form onSubmit={requestPasswordCode}>
                      <label>
                        <span>{copy.currentPassword}</span>
                        <input
                          type="password"
                          value={pwCurrent}
                          onChange={(e) => setPwCurrent(e.target.value)}
                          required
                          autoComplete="current-password"
                        />
                      </label>
                      <button type="submit" disabled={pwBusy} className="shop-admin-primary-btn">
                        {copy.sendCode}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={confirmPasswordChange}>
                      <p className="shop-admin-note">{pwMessage || copy.codeSent}</p>
                      <label>
                        <span>{copy.otpCode}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={pwCode}
                          onChange={(e) => setPwCode(e.target.value)}
                          required
                          autoComplete="one-time-code"
                        />
                      </label>
                      <label>
                        <span>{copy.newPassword}</span>
                        <input
                          type="password"
                          value={pwNext}
                          onChange={(e) => setPwNext(e.target.value)}
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                      </label>
                      <label>
                        <span>{copy.confirmPassword}</span>
                        <input
                          type="password"
                          value={pwNext2}
                          onChange={(e) => setPwNext2(e.target.value)}
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                      </label>
                      <button type="submit" disabled={pwBusy} className="shop-admin-primary-btn">
                        {copy.savePassword}
                      </button>
                    </form>
                  )}
                  {pwError ? <p className="shop-admin-error">{pwError}</p> : null}
                </div>
              ) : null}
              {showTools ? (
                <div className="shop-admin-toolbar shop-admin-toolbar-secondary">
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
                </div>
              ) : null}
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
