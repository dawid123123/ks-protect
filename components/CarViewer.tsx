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

const viewTabLabels: Record<View, 'topView' | 'sideView' | 'rearView'> = {
  front: 'topView',
  side: 'sideView',
  rear: 'rearView',
};

const viewAriaLabels: Record<View, 'frontView' | 'sideView' | 'rearView'> = {
  front: 'frontView',
  side: 'sideView',
  rear: 'rearView',
};

const viewParts: Record<View, Part[]> = {
  front: [
    'hood',
    'rightAPillar',
    'frontBumper',
    'leftMirror',
    'rightMirror',
    'leftHeadlight',
    'rightHeadlight',
    'frontLip',
  ],
  side: [
    'leftFender',
    'frontDoor',
    'rearDoor',
    'leftRearQuarter',
    'sideSkirt',
    'leftMirror',
    'leftAPillar',
    'leftBPillar',
    'leftCPillar',
  ],
  rear: ['roof', 'leftTaillight', 'rightTaillight', 'tailgate', 'rearBumper'],
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
    parts: ['hood'],
  },
  {
    id: 'complete-front',
    parts: [
      'hood',
      'frontBumper',
      'leftFender',
      'rightFender',
      'leftHeadlight',
      'rightHeadlight',
      'frontLip',
    ],
  },
  {
    id: 'full-wrap',
    parts: Object.keys(partPrices) as Part[],
  },
  {
    id: 'custom',
    parts: [],
  },
];

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

export default function CarViewer() {
  const t = useTranslation();
  const { lang } = useLanguage();
  const localizedPartLabels = t.partLabels;
  const [vehicleId, setVehicleId] = useState('gle');
  const vehicle = vehicles.find((item) => item.id === vehicleId) || vehicles[0];
  const [view, setView] = useState<View>('front');
  const [selected, setSelected] = useState<SelectedParts>({});
  const [packageId, setPackageId] = useState<PackageId>('custom');
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
    setPackageId('custom');
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
    setPackageId('custom');
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
    setPackageId('custom');
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
    setPackageId('custom');
    setSelected((current) => {
      if (!isPartSelected(current, canonical)) {
        return current;
      }
      const next = { ...current };
      delete next[canonical];
      return next;
    });
  }

  function selectPackage(nextPackageId: PackageId) {
    setPackageId(nextPackageId);
    const preset = packages.find((item) => item.id === nextPackageId);
    if (preset && preset.parts.length > 0) {
      setSelected(partsToSelection(preset.parts));
    }
  }

  const selectedEntries = getSelectedEntries(selected);

  const total = useMemo(() => getSelectedTotal(selected), [selected]);

  return (
    <div className="configurator configurator-mockup">
      <div className="viewer">
        <div className="ppf-config-header">
          <div>
            <p className="ppf-config-eyebrow">{t.configurator.ppfEyebrow}</p>
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
          className={'parts-grid' + (traceMode ? ' parts-grid-hidden' : '')}
          aria-label={t.configurator.selectBodyParts}
        >
          {catalogParts.map((part) => {
            const qty = getPartQuantity(selected, part);
            const maxQty = getPartMaxQuantity(part);
            const active = qty > 0;
            const partLabel = localizedPartLabels[part];
            return (
              <div key={part} className="part-tile-shell">
                <div className={'part-tile' + (active ? ' active' : '')}>
                  <button
                    type="button"
                    className="part-tile-hit"
                    aria-pressed={active}
                    onClick={() => toggle(part)}
                  >
                    <PartTileIcon part={part} active={active} />
                    <span className="part-tile-label">{partLabel}</span>
                    {maxQty > 1 && (
                      <span className="part-tile-qty-badge">
                        {qty}/{maxQty}
                      </span>
                    )}
                    <span className="part-tooltip part-tile-tooltip" role="tooltip">
                      <small>{partLabel}</small>
                      <strong>{formatLocalizedPrice(lang, partPrices[part])}</strong>
                      <em>
                        {maxQty > 1
                          ? t.configurator.tooltipUseQty + maxQty
                          : active
                            ? t.configurator.tooltipSelected
                            : t.configurator.tooltipClickSelect}
                      </em>
                    </span>
                  </button>
                  {maxQty > 1 ? (
                    <div className="part-qty-controls">
                      <button
                        type="button"
                        className="part-qty-btn"
                        aria-label={t.configurator.tooltipUseQty + partLabel}
                        disabled={qty === 0}
                        onClick={() => decrement(part)}
                      >
                        −
                      </button>
                      <span className="part-qty-value">{qty}</span>
                      <button
                        type="button"
                        className="part-qty-btn"
                        aria-label={t.configurator.tooltipClickSelect + ' ' + partLabel}
                        disabled={qty >= maxQty}
                        onClick={() => increment(part)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    active && (
                      <button
                        type="button"
                        className="part-tile-remove"
                        aria-label={t.configurator.tooltipSelected + ' ' + partLabel}
                        onClick={() => remove(part)}
                      >
                        ×
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
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
                      'package-option' + (packageId === item.id ? ' active' : '')
                    }
                    onClick={() => selectPackage(item.id)}
                  >
                    <strong>{copy.label}</strong>
                    <small>{copy.subtitle}</small>
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
                      {qty > 1 ? ' \u00d7 ' + qty : ''}
                    </span>
                    <div className="summaryRow-actions">
                      {maxQty > 1 && (
                        <div className="part-qty-controls part-qty-controls-compact">
                          <button
                            type="button"
                            className="part-qty-btn"
                            aria-label={t.configurator.tooltipUseQty + partLabel}
                            disabled={qty === 0}
                            onClick={() => decrement(item)}
                          >
                            −
                          </button>
                          <span className="part-qty-value">{qty}</span>
                          <button
                            type="button"
                            className="part-qty-btn"
                            aria-label={t.configurator.tooltipClickSelect + ' ' + partLabel}
                            disabled={qty >= maxQty}
                            onClick={() => increment(item)}
                          >
                            +
                          </button>
                        </div>
                      )}
                      <strong>{formatLocalizedPrice(lang, lineTotal)}</strong>
                      <button
                        type="button"
                        className="summaryRow-remove"
                        aria-label={t.configurator.tooltipSelected + ' ' + partLabel}
                        onClick={() => remove(item)}
                      >
                        ×
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
