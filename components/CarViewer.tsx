'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  formatLocalizedPrice,
  useLanguage,
  useTranslation,
} from '../lib/i18n/context';
import TopView from './TopView';
import SideView from './SideView';
import RearView from './RearView';
import {
  SvgPathEditorPanel,
  useSvgPathEditor,
} from './SvgPathEditor';
import { PartTileIcon } from './PartTileIcon';
import {
  Part,
  PpfCatalogSectionId,
  SelectedParts,
  catalogParts,
  getPartMaxQuantity,
  getPartQuantity,
  getSelectedEntries,
  getSelectedTotal,
  isPartSelected,
  partLabels,
  partPrices,
  partsToSelection,
  ppfCatalogSections,
  ppfEditorExcludedParts,
  resolvePart,
} from './carParts';

export type { Part, SelectedParts } from './carParts';
export {
  catalogParts,
  getPartMaxQuantity,
  getPartQuantity,
  getSelectedEntries,
  getSelectedTotal,
  isPartSelected,
  partLabels,
  partPrices,
  partsToSelection,
  ppfCatalogSections,
  ppfEditorExcludedParts,
  resolvePart,
} from './carParts';

type View = 'front' | 'side' | 'rear';

type PackageId = 'essential' | 'complete-front' | 'full-wrap' | 'custom';

type PackageTranslationKey = 'essential' | 'completeFront' | 'fullWrap' | 'custom';

const packageTranslationKeys: Record<PackageId, PackageTranslationKey> = {
  essential: 'essential',
  'complete-front': 'completeFront',
  'full-wrap': 'fullWrap',
  custom: 'custom',
};

const viewTabLabels: Record<View, 'frontView' | 'sideView' | 'rearView'> = {
  front: 'frontView',
  side: 'sideView',
  rear: 'rearView',
};

const viewAriaLabels: Record<View, 'frontView' | 'sideView' | 'rearView'> = {
  front: 'frontView',
  side: 'sideView',
  rear: 'rearView',
};

const ppfSectionTitleKeys: Record<
  PpfCatalogSectionId,
  'frontView' | 'sideView' | 'rearView'
> = {
  front: 'frontView',
  side: 'sideView',
  rear: 'rearView',
};

const viewParts: Record<View, Part[]> = {
  front: [
    'hood',
    'leftAPillar',
    'rightAPillar',
    'frontBumper',
    'leftMirror',
    'rightMirror',
    'frontLip',
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
    'leftAPillar',
    'leftBPillar',
    'leftCPillar',
  ],
  rear: ['roof', 'tailgate', 'rearBumper'],
};

const zoneSnippetNames: Record<View, string> = {
  front: 'frontZones',
  side: 'sideZones',
  rear: 'rearZones',
};

const packages: {
  id: PackageId;
  parts: Part[];
}[] = [
  {
    id: 'essential',
    parts: [
      'splashGuard',
      'rightSplashGuard',
      'frontDoorLower',
      'rearDoorLower',
      'sideSkirt',
      'sideSkirt',
      'frontWheelArch',
      'rightFrontWheelArch',
      'rearWheelArch',
      'rightRearWheelArch',
    ],
  },
  {
    id: 'complete-front',
    parts: [
      'hood',
      'frontBumper',
      'frontLip',
      'leftMirror',
      'rightMirror',
      'leftAPillar',
      'rightAPillar',
      'leftFender',
      'rightFender',
      'frontWheelArch',
      'rightFrontWheelArch',
    ],
  },
  {
    id: 'full-wrap',
    parts: (Object.keys(partPrices) as Part[]).filter(
      (part) => !ppfEditorExcludedParts.includes(part)
    ),
  },
  {
    id: 'custom',
    parts: [],
  },
];

const combinablePackageIds: PackageId[] = ['essential', 'complete-front'];

function selectionFromPackages(packageIds: PackageId[]): SelectedParts {
  const parts: Part[] = [];
  for (const id of packageIds) {
    const preset = packages.find((item) => item.id === id);
    if (preset?.parts.length) {
      parts.push(...preset.parts);
    }
  }
  return partsToSelection(parts);
}

function isPackageActive(id: PackageId, activePackages: PackageId[]): boolean {
  if (id === 'custom') {
    return activePackages.length === 0;
  }
  return activePackages.includes(id);
}

const vehicles = [
  {
    id: 'gle',
    label: 'Mercedes-Benz GLE',
    className: 'model-suv model-gle',
  },
  {
    id: 'cla',
    label: 'Mercedes-Benz CLA',
    className: 'model-sedan model-cla',
  },
  {
    id: 'cclass',
    label: 'Mercedes-Benz C-Class',
    className: 'model-sedan model-cclass',
  },
  {
    id: 'eclass',
    label: 'Mercedes-Benz E-Class',
    className: 'model-sedan model-eclass',
  },
  {
    id: 'gclass',
    label: 'Mercedes-Benz G-Class',
    className: 'model-boxy model-gclass',
  },
  {
    id: 'amggt',
    label: 'Mercedes-AMG GT',
    className: 'model-coupe model-amggt',
  },
] as const;

export default function CarViewer({
  onAdminSecretClick,
}: {
  onAdminSecretClick?: () => void;
} = {}) {
  const t = useTranslation();
  const { lang } = useLanguage();
  const localizedPartLabels = t.partLabels;
  const [vehicleId, setVehicleId] = useState('gle');
  const vehicle = vehicles.find((item) => item.id === vehicleId) || vehicles[0];
  const [view, setView] = useState<View>('front');
  const [selected, setSelected] = useState<SelectedParts>({});
  const [activePackages, setActivePackages] = useState<PackageId[]>([]);
  const [traceMode, setTraceMode] = useState(false);
  const pathEditor = useSvgPathEditor();
  const { setActivePart } = pathEditor;

  useEffect(() => {
    setActivePart((current) =>
      current && viewParts[view].includes(current) ? current : null
    );
  }, [view, setActivePart]);

  function increment(part: Part) {
    const canonical = resolvePart(part);
    setActivePackages([]);
    setSelected((current) => {
      const qty = getPartQuantity(current, canonical);
      const max = getPartMaxQuantity(canonical);
      if (qty >= max) {
        return current;
      }
      return { ...current, [canonical]: qty + 1 };
    });
  }

  function decrement(part: Part) {
    const canonical = resolvePart(part);
    setActivePackages([]);
    setSelected((current) => {
      const qty = getPartQuantity(current, canonical);
      if (qty <= 0) {
        return current;
      }
      if (qty === 1) {
        const next = { ...current };
        delete next[canonical];
        return next;
      }
      return { ...current, [canonical]: qty - 1 };
    });
  }

  function toggle(part: Part) {
    const canonical = resolvePart(part);
    setActivePackages([]);
    setSelected((current) => {
      const qty = getPartQuantity(current, canonical);
      const max = getPartMaxQuantity(canonical);
      if (max === 1) {
        if (qty > 0) {
          const next = { ...current };
          delete next[canonical];
          return next;
        }
        return { ...current, [canonical]: 1 };
      }
      if (qty >= max) {
        const next = { ...current };
        delete next[canonical];
        return next;
      }
      return { ...current, [canonical]: qty + 1 };
    });
  }

  function remove(part: Part) {
    const canonical = resolvePart(part);
    setActivePackages([]);
    setSelected((current) => {
      if (!isPartSelected(current, canonical)) {
        return current;
      }
      const next = { ...current };
      delete next[canonical];
      return next;
    });
  }

  function togglePackage(nextPackageId: PackageId) {
    if (nextPackageId === 'custom') {
      setActivePackages([]);
      setSelected({});
      return;
    }

    if (nextPackageId === 'full-wrap') {
      const preset = packages.find((item) => item.id === 'full-wrap');
      setActivePackages(['full-wrap']);
      setSelected(preset ? partsToSelection(preset.parts) : {});
      return;
    }

    if (!combinablePackageIds.includes(nextPackageId)) {
      return;
    }

    setActivePackages((current) => {
      const base = current.filter((id) => id !== 'full-wrap');
      const nextPackages = base.includes(nextPackageId)
        ? base.filter((id) => id !== nextPackageId)
        : [...base, nextPackageId];
      setSelected(
        nextPackages.length > 0 ? selectionFromPackages(nextPackages) : {}
      );
      return nextPackages;
    });
  }

  const selectedEntries = getSelectedEntries(selected);

  const total = useMemo(() => getSelectedTotal(selected), [selected]);

  return (
    <div className="configurator configurator-mockup">
      <div className="viewer">
        <div className="ppf-config-header">
          <div>
            <p
              className="ppf-config-eyebrow shop-admin-trigger"
              onClick={onAdminSecretClick}
              title=""
            >
              {t.configurator.ppfEyebrow}
            </p>
            <h2>{t.configurator.ppfTitle}</h2>
            <p>{t.configurator.ppfLead}</p>
          </div>
          <label className="vehicle-picker ppf-config-picker">
            <span>{t.configurator.selectVehicle}</span>
            <select
              aria-label={t.configurator.selectVehicleAria}
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
            >
              {vehicles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="ppf-config-toolbar">
          <button
            type="button"
            className={
              'ppf-trace-toggle' + (traceMode ? ' active' : '')
            }
            aria-pressed={traceMode}
            onClick={() => setTraceMode((current) => !current)}
          >
            {traceMode ? t.configurator.exitSvgEditor : t.configurator.openSvgEditor}
          </button>
        </div>

        <div className="ppf-view-tabs" aria-label={t.configurator.selectView}>
          {(['front', 'side', 'rear'] as View[]).map((item) => (
            <button
              key={item}
              aria-label={
                t.configurator.showView + ' ' + t.configurator[viewAriaLabels[item]]
              }
              className={'ppf-view-tab' + (view === item ? ' active' : '')}
              onClick={() => setView(item)}
            >
              {t.configurator[viewTabLabels[item]]}
            </button>
          ))}
        </div>

        <div className="viewerCanvas viewerCanvas-mockup">
          {view === 'front' && (
            <TopView
              selected={selected}
              toggle={toggle}
              vehicleClass={vehicle.className}
              vehicleName={vehicle.label}
              vehicleId={vehicle.id}
              traceMode={traceMode}
              tracePoints={pathEditor.points}
              tracedPaths={pathEditor.savedPaths}
              onTracePoint={pathEditor.addPoint}
            />
          )}
          {view === 'side' && (
            <SideView
              selected={selected}
              toggle={toggle}
              vehicleClass={vehicle.className}
              vehicleName={vehicle.label}
              vehicleId={vehicle.id}
              traceMode={traceMode}
              tracePoints={pathEditor.points}
              tracedPaths={pathEditor.savedPaths}
              onTracePoint={pathEditor.addPoint}
            />
          )}
          {view === 'rear' && (
            <RearView
              selected={selected}
              toggle={toggle}
              vehicleClass={vehicle.className}
              vehicleName={vehicle.label}
              vehicleId={vehicle.id}
              traceMode={traceMode}
              tracePoints={pathEditor.points}
              tracedPaths={pathEditor.savedPaths}
              onTracePoint={pathEditor.addPoint}
            />
          )}
        </div>

        {traceMode && (
          <SvgPathEditorPanel
            parts={viewParts[view]}
            zonesName={zoneSnippetNames[view]}
            points={pathEditor.points}
            savedPaths={pathEditor.savedPaths}
            activePart={pathEditor.activePart}
            setActivePart={pathEditor.setActivePart}
            lastExported={pathEditor.lastExported}
            onUndo={pathEditor.undoPoint}
            onClear={pathEditor.clearPoints}
            onFinalize={pathEditor.finalizePath}
            onRemoveSaved={pathEditor.removeSavedPath}
            onLoadSaved={pathEditor.loadSavedPath}
          />
        )}

        <div
          className={'ppf-parts-sections' + (traceMode ? ' parts-grid-hidden' : '')}
          aria-label={t.configurator.selectBodyParts}
        >
          {ppfCatalogSections
            .filter((section) => section.id === view)
            .map((section) => (
            <section key={section.id} className="ppf-parts-section">
              <h3 className="ppf-parts-section-title">
                {t.configurator[ppfSectionTitleKeys[section.id]]}
              </h3>
              <div className="ppf-parts-grid">
                {section.parts.map((part) => {
                  const qty = getPartQuantity(selected, part);
                  const maxQty = getPartMaxQuantity(part);
                  const active = qty > 0;
                  const partLabel = localizedPartLabels[part];
                  return (
                    <div key={part} className="part-tile-shell ppf-part-tile-shell">
                      <div
                        className={
                          'part-tile tint-part-tile ppf-part-tile' +
                          (active ? ' active selected' : '')
                        }
                      >
                        <button
                          type="button"
                          className="part-tile-hit ppf-part-tile-hit"
                          aria-pressed={active}
                          onClick={() => toggle(part)}
                        >
                          <span className="ppf-part-tile-icon-stage">
                            <PartTileIcon part={part} active={active} />
                          </span>
                          <span className="ppf-part-tile-meta">
                            <span className="part-tile-label">{partLabel}</span>
                            <span className="ppf-part-tile-price">
                              {formatLocalizedPrice(lang, partPrices[part])}
                            </span>
                          </span>
                        </button>
                        {maxQty > 1 && (
                          <div className="ppf-part-tile-footer">
                            <div className="part-qty-controls part-qty-controls-compact">
                              <button
                                type="button"
                                className="part-qty-btn"
                                aria-label={t.configurator.tooltipUseQty + partLabel}
                                disabled={qty === 0}
                                onClick={() => decrement(part)}
                              >
                                −
                              </button>
                              <span className="part-qty-value">
                                {qty}/{maxQty}
                              </span>
                              <button
                                type="button"
                                className="part-qty-btn"
                                aria-label={
                                  t.configurator.tooltipClickSelect + ' ' + partLabel
                                }
                                disabled={qty >= maxQty}
                                onClick={() => increment(part)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                        {active && maxQty === 1 && (
                          <button
                            type="button"
                            className="part-tile-remove"
                            aria-label={t.configurator.tooltipSelected + ' ' + partLabel}
                            onClick={() => remove(part)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <aside className="sidebar sidebar-mockup">
        <h2>{t.configurator.summary}</h2>
        <div className="summaryCard summaryCard-mockup">
          <label className="sidebar-car-picker">
            <span>{t.configurator.vehicle}</span>
            <select
              aria-label={t.configurator.selectVehicleSummaryAria}
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
            >
              {vehicles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="packageSection">
            <h4>{t.configurator.choosePackage}</h4>
            <div className="package-options">
              {packages.map((item) => {
                const copy =
                  t.configurator.packages[packageTranslationKeys[item.id]];
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      'package-option' +
                      (isPackageActive(item.id, activePackages) ? ' active' : '')
                    }
                    aria-pressed={isPackageActive(item.id, activePackages)}
                    onClick={() => togglePackage(item.id)}
                  >
                    <strong>{copy.label}</strong>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="summaryDivider" />

          {selectedEntries.length === 0 ? (
            <div className="empty-state">
              <span>+</span>
              <p>{t.configurator.emptyPpf.title}</p>
              <small>{t.configurator.emptyPpf.hint}</small>
            </div>
          ) : (
            <div className="selected-parts">
              {selectedEntries.map(([item, qty]) => {
                const maxQty = getPartMaxQuantity(item);
                const lineTotal = partPrices[item] * qty;
                const partLabel = localizedPartLabels[item];
                return (
                  <div key={item} className="summaryRow">
                    <span>
                      <i aria-hidden="true" /> {partLabel}
                      {maxQty > 1 && qty > 1 && (
                        <small className="tint-summary-level">
                          {' \u00b7 ' + qty + '/2'}
                        </small>
                      )}
                    </span>
                    <div className="summaryRow-actions">
                      <strong>{formatLocalizedPrice(lang, lineTotal)}</strong>
                      <button
                        type="button"
                        className="summaryRow-remove"
                        aria-label={t.configurator.tooltipSelected + ' ' + partLabel}
                        onClick={() => remove(item)}
                      >
                        {'\u00d7'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="summaryDivider" />
          <div className="summaryTotal">
            <span>{t.configurator.total}</span>
            <h2>{formatLocalizedPrice(lang, total)}</h2>
          </div>
          <a href="/#contact" className="configurator-cta configurator-cta-mockup">
            {t.configurator.getQuote}
          </a>
        </div>
      </aside>
    </div>
  );
}
