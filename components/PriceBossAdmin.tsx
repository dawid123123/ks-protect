'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../lib/i18n/context';
import {
  LivePricing,
  PricingOverrides,
  applyPricingOverrides,
  getDefaultPricingSnapshot,
  getLivePricing,
} from '../lib/pricingRuntime';
import { partLabels, partZoneAliases, Part } from './carParts';
import { tintPpfLabels, tintWindowLabels } from './tintData';
import { TintPpfZone, TintWindow } from './tintTypes';

export type PriceBossMode = 'ppf' | 'tint';

type PriceBossAdminProps = {
  open: boolean;
  mode: PriceBossMode;
  onClose: () => void;
  onPricingApplied: () => void;
};

type PriceRow = {
  key: string;
  label: string;
  value: string;
};

function pricingToRows(mode: PriceBossMode, pricing: LivePricing): PriceRow[] {
  if (mode === 'ppf') {
    const aliasTargets = new Set(Object.keys(partZoneAliases) as Part[]);
    return (Object.keys(pricing.ppfPartPrices) as Part[])
      .filter((key) => !aliasTargets.has(key))
      .map((key) => ({
        key,
        label: partLabels[key] || key,
        value: String(pricing.ppfPartPrices[key]),
      }));
  }

  const windowRows = (Object.keys(pricing.tintWindowBasePrices) as TintWindow[])
    .filter((key) => pricing.tintWindowBasePrices[key] > 0 || key === 'windscreenStrip')
    .filter((key) => key !== 'frontRight' && key !== 'rearRight')
    .map((key) => ({
      key: 'window:' + key,
      label: 'Tint · ' + (tintWindowLabels[key] || key),
      value: String(pricing.tintWindowBasePrices[key]),
    }));

  const ppfRows = (Object.keys(pricing.tintPpfBasePrices) as TintPpfZone[]).map(
    (key) => ({
      key: 'ppf:' + key,
      label: 'Dark PPF · ' + (tintPpfLabels[key] || key),
      value: String(pricing.tintPpfBasePrices[key]),
    })
  );

  const guideRows = (
    Object.keys(pricing.tintPriceGuideAmounts) as (keyof LivePricing['tintPriceGuideAmounts'])[]
  ).map((key) => ({
    key: 'guide:' + key,
    label:
      key === 'small'
        ? 'Price guide · Small'
        : key === 'large'
          ? 'Price guide · Large'
          : 'Price guide · Dechrome',
    value: String(pricing.tintPriceGuideAmounts[key]),
  }));

  return [...windowRows, ...ppfRows, ...guideRows];
}

function rowsToLive(
  mode: PriceBossMode,
  rows: PriceRow[],
  current: LivePricing
): LivePricing {
  const next: LivePricing = {
    ppfPartPrices: { ...current.ppfPartPrices },
    tintWindowBasePrices: { ...current.tintWindowBasePrices },
    tintPpfBasePrices: { ...current.tintPpfBasePrices },
    tintPriceGuideAmounts: { ...current.tintPriceGuideAmounts },
    tintLevelMultipliers: { ...current.tintLevelMultipliers },
    tintVehicleSizeMultipliers: { ...current.tintVehicleSizeMultipliers },
  };

  if (mode === 'ppf') {
    rows.forEach((row) => {
      const parsed = Math.round(Number(row.value.replace(/\s/g, '')));
      if (!Number.isFinite(parsed) || parsed < 0) {
        return;
      }
      const key = row.key as Part;
      next.ppfPartPrices[key] = parsed;
      (Object.entries(partZoneAliases) as [Part, Part][]).forEach(
        ([alias, canonical]) => {
          if (canonical === key) {
            next.ppfPartPrices[alias] = parsed;
          }
        }
      );
    });
    return next;
  }

  rows.forEach((row) => {
    const parsed = Math.round(Number(row.value.replace(/\s/g, '')));
    if (!Number.isFinite(parsed) || parsed < 0) {
      return;
    }
    if (row.key.startsWith('window:')) {
      const key = row.key.slice(7) as TintWindow;
      next.tintWindowBasePrices[key] = parsed;
      if (key === 'frontLeft') next.tintWindowBasePrices.frontRight = parsed;
      if (key === 'rearLeft') next.tintWindowBasePrices.rearRight = parsed;
    } else if (row.key.startsWith('ppf:')) {
      const key = row.key.slice(4) as TintPpfZone;
      next.tintPpfBasePrices[key] = parsed;
    } else if (row.key.startsWith('guide:')) {
      const key = row.key.slice(6) as keyof LivePricing['tintPriceGuideAmounts'];
      next.tintPriceGuideAmounts[key] = parsed;
    }
  });

  return next;
}

function liveToOverrides(live: LivePricing): PricingOverrides {
  const defaults = getDefaultPricingSnapshot();
  return {
    ppfPartPrices: pickDiff(live.ppfPartPrices, defaults.ppfPartPrices),
    tintWindowBasePrices: pickDiff(
      live.tintWindowBasePrices,
      defaults.tintWindowBasePrices
    ),
    tintPpfBasePrices: pickDiff(live.tintPpfBasePrices, defaults.tintPpfBasePrices),
    tintPriceGuideAmounts: pickDiff(
      live.tintPriceGuideAmounts,
      defaults.tintPriceGuideAmounts
    ),
    tintLevelMultipliers: pickDiff(
      live.tintLevelMultipliers,
      defaults.tintLevelMultipliers
    ),
    tintVehicleSizeMultipliers: pickDiff(
      live.tintVehicleSizeMultipliers,
      defaults.tintVehicleSizeMultipliers
    ),
  };
}

function pickDiff<T extends Record<string, number>>(
  next: T,
  base: T
): Partial<T> | undefined {
  const diff: Partial<T> = {};
  let changed = false;
  (Object.keys(next) as (keyof T)[]).forEach((key) => {
    if (next[key] !== base[key]) {
      diff[key] = next[key];
      changed = true;
    }
  });
  return changed ? diff : undefined;
}

export default function PriceBossAdmin({
  open,
  mode,
  onClose,
  onPricingApplied,
}: PriceBossAdminProps) {
  const { lang } = useLanguage();
  const isIs = lang === 'is';
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [live, setLive] = useState<LivePricing>(() => getLivePricing());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [blobConfigured, setBlobConfigured] = useState(true);

  const copy = useMemo(
    () =>
      isIs
        ? {
            title: mode === 'ppf' ? 'PPF verðstjóri' : 'Tint verðstjóri',
            lead:
              mode === 'ppf'
                ? 'Breyttu aðeins PPF verðum. Vistað fyrir alla strax.'
                : 'Breyttu aðeins tint / dark PPF verðum. Vistað fyrir alla strax.',
            login: 'Innskráning',
            password: 'Lykilorð',
            signIn: 'Skrá inn',
            signOut: 'Útskrá',
            close: 'Loka',
            save: 'Vista verð',
            reset: 'Endurstilla',
            wrongPassword: 'Rangt lykilorð',
            saved: 'Verð vistuð fyrir alla',
            resetDone: 'Sjálfgefin verð endurstillt',
            tip: 'Ábending: sama lykilorð og Netverslun. Á Vercel þarf Blob storage.',
            blobWarn:
              'Blob er ekki tengt — vistað aðeins á þessari vél / preview.',
          }
        : {
            title: mode === 'ppf' ? 'PPF price boss' : 'Tint price boss',
            lead:
              mode === 'ppf'
                ? 'Change PPF prices only. Saves for everyone immediately.'
                : 'Change tint / dark PPF prices only. Saves for everyone immediately.',
            login: 'Sign in',
            password: 'Password',
            signIn: 'Sign in',
            signOut: 'Sign out',
            close: 'Close',
            save: 'Save prices',
            reset: 'Reset defaults',
            wrongPassword: 'Wrong password',
            saved: 'Prices saved for everyone',
            resetDone: 'Default prices restored',
            tip: 'Tip: same password as Netverslun. On Vercel you need Blob storage.',
            blobWarn: 'Blob not linked — saving only on this machine / preview.',
          },
    [isIs, mode]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    setChecking(true);
    setNotice('');

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

    fetch('/api/pricing', { cache: 'no-store' })
      .then((res) => res.json())
      .then(
        (data: {
          pricing?: LivePricing;
          overrides?: PricingOverrides;
          blobConfigured?: boolean;
        }) => {
          if (cancelled) {
            return;
          }
          if (typeof data.blobConfigured === 'boolean') {
            setBlobConfigured(data.blobConfigured);
          }
          if (data.overrides) {
            applyPricingOverrides(data.overrides);
          }
          const next = data.pricing || getLivePricing();
          setLive(next);
          setRows(pricingToRows(mode, next));
        }
      )
      .catch(() => {
        if (!cancelled) {
          const next = getLivePricing();
          setLive(next);
          setRows(pricingToRows(mode, next));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, mode]);

  if (!open || !mounted) {
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
  }

  async function persist(overrides: PricingOverrides, successMessage: string) {
    setSaving(true);
    setNotice('');

    try {
      const response = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        pricing?: LivePricing;
        overrides?: PricingOverrides;
        blobConfigured?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.pricing) {
        throw new Error(data.error || 'save_failed');
      }

      if (typeof data.blobConfigured === 'boolean') {
        setBlobConfigured(data.blobConfigured);
      }

      applyPricingOverrides(data.overrides || overrides);
      setLive(data.pricing);
      setRows(pricingToRows(mode, data.pricing));
      onPricingApplied();
      setNotice(successMessage);
    } catch {
      setNotice(
        isIs
          ? 'Mistókst að vista á netinu. Athugaðu Blob / innskráningu.'
          : 'Failed to save online. Check Blob setup / login.'
      );
    } finally {
      setSaving(false);
    }
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    const nextLive = rowsToLive(mode, rows, live);
    void persist(liveToOverrides(nextLive), copy.saved);
  }

  function handleReset() {
    const defaults = getDefaultPricingSnapshot();
    const nextLive: LivePricing =
      mode === 'ppf'
        ? {
            ...live,
            ppfPartPrices: { ...defaults.ppfPartPrices },
          }
        : {
            ...live,
            tintWindowBasePrices: { ...defaults.tintWindowBasePrices },
            tintPpfBasePrices: { ...defaults.tintPpfBasePrices },
            tintPriceGuideAmounts: { ...defaults.tintPriceGuideAmounts },
          };
    void persist(liveToOverrides(nextLive), copy.resetDone);
  }

  return createPortal(
    <div className="shop-admin-overlay" role="dialog" aria-modal="true">
      <div className="shop-admin-panel price-boss-panel">
        <div className="shop-admin-head">
          <div>
            <h2>{copy.title}</h2>
            <p>{copy.lead}</p>
          </div>
          <button type="button" className="shop-admin-close" onClick={onClose}>
            {copy.close}
          </button>
        </div>

        {checking ? (
          <p className="shop-admin-note">...</p>
        ) : !authed ? (
          <form className="shop-admin-login" onSubmit={handleLogin}>
            <label>
              <span>{copy.password}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button type="submit">{copy.signIn}</button>
            {loginError ? <p className="shop-admin-error">{loginError}</p> : null}
          </form>
        ) : (
          <div className="shop-admin-body">
            <div className="shop-admin-toolbar">
              <button type="button" onClick={handleReset} disabled={saving}>
                {copy.reset}
              </button>
              <button type="button" onClick={handleLogout}>
                {copy.signOut}
              </button>
            </div>

            <p className="shop-admin-tip">{copy.tip}</p>
            {!blobConfigured ? (
              <p className="shop-admin-error">{copy.blobWarn}</p>
            ) : null}
            {notice ? <p className="shop-admin-note">{notice}</p> : null}

            <form className="shop-admin-form price-boss-form" onSubmit={handleSave}>
              <div className="price-boss-grid">
                {rows.map((row) => (
                  <label key={row.key}>
                    <span>{row.label}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRows((prev) =>
                          prev.map((item) =>
                            item.key === row.key ? { ...item, value } : item
                          )
                        );
                      }}
                    />
                  </label>
                ))}
              </div>
              <div className="shop-admin-actions">
                <button type="submit" disabled={saving}>
                  {saving ? '...' : copy.save}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
