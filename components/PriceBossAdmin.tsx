'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../lib/i18n/context';
import {
  LivePricing,
  PricingOverrides,
  applyPricingOverrides,
  getDefaultPricingSnapshot,
  getLivePricing,
} from '../lib/pricingRuntime';
import { partLabels, partZoneAliases, Part } from './carParts';
import { PartTileIcon } from './PartTileIcon';
import { tintPpfLabels, tintWindowLabels } from './tintData';
import { TintWindowIcon } from './TintWindowIcon';
import { TintPpfZone, TintWindow } from './tintTypes';
import { frontPhoto } from './TopView';

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
  groupId: string;
  kind: 'ppf' | 'tint-window' | 'tint-ppf' | 'guide';
  part?: Part;
  window?: TintWindow;
};

type PriceGroup = {
  id: string;
  title: string;
  photo: string;
  hint: string;
};

const SIDE_PHOTO = '/gle-side.png';
const REAR_PHOTO = '/gle-rear.png';

const ppfGroupParts: Record<string, Part[]> = {
  front: [
    'hood',
    'frontBumper',
    'frontLip',
    'leftMirror',
    'leftAPillar',
    'leftHeadlight',
  ],
  side: [
    'leftFender',
    'frontDoor',
    'rearDoor',
    'leftRearQuarter',
    'splashGuard',
    'frontDoorLower',
    'rearDoorLower',
    'sideSkirt',
    'frontWheelArch',
    'rearWheelArch',
    'leftBPillar',
    'leftCPillar',
  ],
  rear: [
    'roof',
    'tailgate',
    'rearBumper',
    'rearWindow',
    'leftTaillight',
  ],
};

function formatIsk(value: string) {
  const n = Math.round(Number(String(value).replace(/\s/g, '')));
  if (!Number.isFinite(n)) {
    return value;
  }
  return n.toLocaleString('is-IS');
}

function pricingToRows(mode: PriceBossMode, pricing: LivePricing): PriceRow[] {
  if (mode === 'ppf') {
    const aliasTargets = new Set(Object.keys(partZoneAliases) as Part[]);
    const placed = new Set<Part>();
    const rows: PriceRow[] = [];

    (['front', 'side', 'rear'] as const).forEach((groupId) => {
      ppfGroupParts[groupId].forEach((part) => {
        if (aliasTargets.has(part) || placed.has(part)) {
          return;
        }
        if (!(part in pricing.ppfPartPrices)) {
          return;
        }
        placed.add(part);
        rows.push({
          key: part,
          label: partLabels[part] || part,
          value: String(pricing.ppfPartPrices[part]),
          groupId,
          kind: 'ppf',
          part,
        });
      });
    });

    (Object.keys(pricing.ppfPartPrices) as Part[]).forEach((part) => {
      if (aliasTargets.has(part) || placed.has(part)) {
        return;
      }
      rows.push({
        key: part,
        label: partLabels[part] || part,
        value: String(pricing.ppfPartPrices[part]),
        groupId: 'front',
        kind: 'ppf',
        part,
      });
    });

    return rows;
  }

  const windowRows = (Object.keys(pricing.tintWindowBasePrices) as TintWindow[])
    .filter((key) => pricing.tintWindowBasePrices[key] > 0 || key === 'windscreenStrip')
    .filter((key) => key !== 'frontRight' && key !== 'rearRight')
    .map((key) => ({
      key: 'window:' + key,
      label: tintWindowLabels[key] || key,
      value: String(pricing.tintWindowBasePrices[key]),
      groupId: 'tint',
      kind: 'tint-window' as const,
      window: key,
    }));

  const ppfRows = (Object.keys(pricing.tintPpfBasePrices) as TintPpfZone[]).map(
    (key) => ({
      key: 'ppf:' + key,
      label: tintPpfLabels[key] || key,
      value: String(pricing.tintPpfBasePrices[key]),
      groupId: 'dark-ppf',
      kind: 'tint-ppf' as const,
      window: key as TintWindow,
    })
  );

  const guideRows = (
    Object.keys(pricing.tintPriceGuideAmounts) as (keyof LivePricing['tintPriceGuideAmounts'])[]
  ).map((key) => ({
    key: 'guide:' + key,
    label:
      key === 'small'
        ? 'Small car'
        : key === 'large'
          ? 'Large car'
          : 'Dechrome',
    value: String(pricing.tintPriceGuideAmounts[key]),
    groupId: 'guide',
    kind: 'guide' as const,
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

function defaultValueForRow(row: PriceRow, defaults: LivePricing): number {
  if (row.kind === 'ppf' && row.part) {
    return defaults.ppfPartPrices[row.part];
  }
  if (row.kind === 'tint-window' && row.window) {
    return defaults.tintWindowBasePrices[row.window];
  }
  if (row.kind === 'tint-ppf' && row.window) {
    return defaults.tintPpfBasePrices[row.window as TintPpfZone];
  }
  if (row.kind === 'guide') {
    const key = row.key.slice(6) as keyof LivePricing['tintPriceGuideAmounts'];
    return defaults.tintPriceGuideAmounts[key];
  }
  return 0;
}

export default function PriceBossAdmin({
  open,
  mode,
  onClose,
  onPricingApplied,
}: PriceBossAdminProps) {
  const { lang } = useLanguage();
  const isIs = lang === 'is';
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [live, setLive] = useState<LivePricing>(() => getLivePricing());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [blobConfigured, setBlobConfigured] = useState(true);
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');

  const defaults = useMemo(() => getDefaultPricingSnapshot(), []);

  const groups: PriceGroup[] = useMemo(() => {
    if (mode === 'ppf') {
      return [
        {
          id: 'front',
          title: isIs ? 'Framskýn' : 'Front view',
          photo: frontPhoto,
          hint: isIs ? 'Húdd, stuðari, speglar…' : 'Hood, bumper, mirrors…',
        },
        {
          id: 'side',
          title: isIs ? 'Hliðarútsýni' : 'Side view',
          photo: SIDE_PHOTO,
          hint: isIs ? 'Hurðir, fender, skirt…' : 'Doors, fender, skirt…',
        },
        {
          id: 'rear',
          title: isIs ? 'Afturútsýni' : 'Rear view',
          photo: REAR_PHOTO,
          hint: isIs ? 'Þak, afturhluti…' : 'Roof, tailgate…',
        },
      ];
    }

    return [
      {
        id: 'tint',
        title: isIs ? 'Gluggatint' : 'Window tint',
        photo: SIDE_PHOTO,
        hint: isIs ? 'Grunnverð á rúður' : 'Base window prices',
      },
      {
        id: 'dark-ppf',
        title: 'Dark PPF',
        photo: frontPhoto,
        hint: isIs ? 'Ljós / ræma' : 'Lights / strip',
      },
      {
        id: 'guide',
        title: isIs ? 'Verðleiðarvísir' : 'Price guide',
        photo: REAR_PHOTO,
        hint: isIs ? 'Fastar leiðbeinandi tölur' : 'Static guide amounts',
      },
    ];
  }, [isIs, mode]);

  const copy = useMemo(
    () =>
      isIs
        ? {
            title: mode === 'ppf' ? 'PPF verðstjóri' : 'Tint verðstjóri',
            lead:
              mode === 'ppf'
                ? 'Smelltu á hluta, breyttu verði. Vistað fyrir alla.'
                : 'Breyttu tint og dark PPF verðum. Vistað fyrir alla.',
            password: 'Lykilorð',
            signIn: 'Skrá inn',
            signOut: 'Útskrá',
            close: 'Loka',
            save: 'Vista öll verð',
            reset: 'Endurstilla',
            wrongPassword: 'Rangt lykilorð',
            saved: 'Verð vistuð fyrir alla',
            resetDone: 'Sjálfgefin verð endurstillt',
            tip: 'Sama lykilorð og Netverslun.',
            blobWarn: 'Blob er ekki tengt — vistað aðeins hér.',
            search: 'Leita að hluta…',
            all: 'Allt',
            changed: 'Breytt',
            default: 'Sjálfgefið',
            kr: 'kr.',
          }
        : {
            title: mode === 'ppf' ? 'PPF price boss' : 'Tint price boss',
            lead:
              mode === 'ppf'
                ? 'Pick a panel, edit the price. Saves for everyone.'
                : 'Edit tint and dark PPF prices. Saves for everyone.',
            password: 'Password',
            signIn: 'Sign in',
            signOut: 'Sign out',
            close: 'Close',
            save: 'Save all prices',
            reset: 'Reset defaults',
            wrongPassword: 'Wrong password',
            saved: 'Prices saved for everyone',
            resetDone: 'Default prices restored',
            tip: 'Same password as Netverslun.',
            blobWarn: 'Blob not linked — saving only here.',
            search: 'Search part…',
            all: 'All',
            changed: 'Changed',
            default: 'Default',
            kr: 'kr.',
          },
    [isIs, mode]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery('');
    setActiveGroup('all');
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

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (activeGroup !== 'all' && row.groupId !== activeGroup) {
        return false;
      }
      if (!q) {
        return true;
      }
      return row.label.toLowerCase().includes(q) || row.key.toLowerCase().includes(q);
    });
  }, [rows, query, activeGroup]);

  const grouped = useMemo(() => {
    return groups
      .map((group) => ({
        group,
        rows: filteredRows.filter((row) => row.groupId === group.id),
      }))
      .filter((item) => item.rows.length > 0);
  }, [groups, filteredRows]);

  const changedCount = useMemo(() => {
    return rows.filter((row) => {
      const current = Math.round(Number(row.value.replace(/\s/g, '')));
      return current !== defaultValueForRow(row, defaults);
    }).length;
  }, [rows, defaults]);

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
          ? 'Mistókst að vista. Athugaðu Blob / innskráningu.'
          : 'Failed to save. Check Blob / login.'
      );
    } finally {
      setSaving(false);
    }
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    void persist(liveToOverrides(rowsToLive(mode, rows, live)), copy.saved);
  }

  function handleReset() {
    const snap = getDefaultPricingSnapshot();
    const nextLive: LivePricing =
      mode === 'ppf'
        ? { ...live, ppfPartPrices: { ...snap.ppfPartPrices } }
        : {
            ...live,
            tintWindowBasePrices: { ...snap.tintWindowBasePrices },
            tintPpfBasePrices: { ...snap.tintPpfBasePrices },
            tintPriceGuideAmounts: { ...snap.tintPriceGuideAmounts },
          };
    void persist(liveToOverrides(nextLive), copy.resetDone);
  }

  function updateRow(key: string, value: string) {
    setRows((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item))
    );
  }

  return (
    <div className="shop-admin-overlay" role="dialog" aria-modal="true">
      <div className="shop-admin-panel price-boss-panel">
        <div className="shop-admin-head">
          <div>
            <p className="eyebrow">{mode === 'ppf' ? 'PPF' : 'TINT'}</p>
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
          <form className="price-boss-shell" onSubmit={handleSave}>
            <div className="price-boss-toolbar">
              <input
                className="price-boss-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.search}
              />
              <div className="price-boss-tabs">
                <button
                  type="button"
                  className={activeGroup === 'all' ? 'active' : ''}
                  onClick={() => setActiveGroup('all')}
                >
                  {copy.all}
                </button>
                {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={activeGroup === group.id ? 'active' : ''}
                    onClick={() => setActiveGroup(group.id)}
                  >
                    {group.title}
                  </button>
                ))}
              </div>
            </div>

            {!blobConfigured ? (
              <p className="shop-admin-error">{copy.blobWarn}</p>
            ) : null}
            {notice ? <p className="shop-admin-note">{notice}</p> : null}

            <div className="price-boss-sections">
              {grouped.map(({ group, rows: sectionRows }) => (
                <section key={group.id} className="price-boss-section">
                  <div className="price-boss-section-head">
                    <div className="price-boss-section-photo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={group.photo} alt="" />
                    </div>
                    <div>
                      <h3>{group.title}</h3>
                      <p>{group.hint}</p>
                    </div>
                  </div>

                  <div className="price-boss-cards">
                    {sectionRows.map((row) => {
                      const def = defaultValueForRow(row, defaults);
                      const current = Math.round(
                        Number(row.value.replace(/\s/g, ''))
                      );
                      const changed =
                        Number.isFinite(current) && current !== def;

                      return (
                        <label
                          key={row.key}
                          className={
                            'price-boss-card' + (changed ? ' changed' : '')
                          }
                        >
                          <span className="price-boss-card-preview">
                            {row.kind === 'ppf' && row.part ? (
                              <PartTileIcon part={row.part} active={changed} />
                            ) : row.window ? (
                              <TintWindowIcon
                                window={row.window}
                                active={changed}
                                level={row.kind === 'tint-window' ? 25 : null}
                                ppfSelected={row.kind === 'tint-ppf'}
                              />
                            ) : (
                              <span className="price-boss-card-fallback">
                                {row.label.slice(0, 1)}
                              </span>
                            )}
                          </span>
                          <span className="price-boss-card-meta">
                            <strong>{row.label}</strong>
                            <small>
                              {copy.default}: {def.toLocaleString('is-IS')}{' '}
                              {copy.kr}
                            </small>
                            {changed ? (
                              <em className="price-boss-changed">{copy.changed}</em>
                            ) : null}
                          </span>
                          <span className="price-boss-card-input">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={row.value}
                              onChange={(e) =>
                                updateRow(row.key, e.target.value)
                              }
                              onBlur={() =>
                                updateRow(row.key, formatIsk(row.value))
                              }
                            />
                            <span>{copy.kr}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="price-boss-footer">
              <p>
                {changedCount > 0
                  ? changedCount +
                    (isIs ? ' breytt verð' : ' changed prices')
                  : isIs
                    ? 'Engar breytingar'
                    : 'No changes'}
              </p>
              <div className="price-boss-footer-actions">
                <button
                  type="button"
                  className="price-boss-footer-secondary"
                  onClick={handleReset}
                  disabled={saving}
                >
                  {copy.reset}
                </button>
                <button
                  type="button"
                  className="price-boss-footer-secondary"
                  onClick={handleLogout}
                >
                  {copy.signOut}
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? '...' : copy.save}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
