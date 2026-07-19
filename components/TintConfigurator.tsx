'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  formatLocalizedPrice,
  useLanguage,
  useTranslation,
} from '../lib/i18n/context';
import TintPhotoView from './TintPhotoView';
import { TintWindowIcon } from './TintWindowIcon';
import {
  getTintPpfEntries,
  getTintPpfPrice,
  getTintPpfTotal,
  getTintLevel,
  getTintMaxQuantity,
  getTintQuantity,
  getTintSelectionEntries,
  getTintSelectionTotal,
  getTintWindowPrice,
  isTintPpfZone,
  isTintWindowSelected,
  resolveTintWindow,
  tintLevelShortLabels,
  tintLevels,
  tintOverlayOpacity,
  tintVehicles,
  tintPriceGuide,
} from './tintData';
import {
  tintViewWindows,
  tintViewZones,
  tintZoneSnippetNames,
} from './tintPhotoZones';
import {
  TintSvgPathEditorPanel,
  useTintPathEditor,
} from './TintSvgPathEditor';
import {
  TintLevel,
  TintPpfSelection,
  TintPpfZone,
  TintSelection,
  TintVehicleId,
  TintView,
  TintWindow,
} from './tintTypes';

function TintVltCard({
  level,
  levelLabel,
  active,
  price,
  disabled,
  onClick,
  formatPrice,
}: {
  level: TintLevel;
  levelLabel: string;
  active: boolean;
  price: number;
  disabled?: boolean;
  onClick: () => void;
  formatPrice: (value: number) => string;
}) {
  const opacity = tintOverlayOpacity(level);
  const tone = levelLabel.split(' \u00b7 ')[1] ?? '';

  return (
    <button
      type="button"
      className={'tint-vlt-card' + (active ? ' active' : '')}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="tint-vlt-preview" aria-hidden="true">
        <span className="tint-vlt-preview-glass" />
        <span
          className="tint-vlt-preview-overlay"
          style={{ background: `rgba(8, 12, 18, ${opacity})` }}
        />
        <span className="tint-vlt-preview-shine" />
      </span>
      <span className="tint-vlt-value">{tintLevelShortLabels[level]}</span>
      <span className="tint-vlt-tone">{tone}</span>
      <span className="tint-vlt-price">{formatPrice(price)}</span>
    </button>
  );
}

const tintViewTabKeys: Record<TintView, 'frontView' | 'sideView' | 'rearView'> = {
  front: 'frontView',
  side: 'sideView',
  rear: 'rearView',
};

export default function TintConfigurator() {
  const t = useTranslation();
  const { lang } = useLanguage();
  const tintWindowLabels = t.tintWindowLabels;
  const tintLevelLabels = t.tintLevelLabels;
  const tintPpfLabels = t.tintPpfLabels;
  const tintPpfProductLabels = t.tintPpfProductLabels;
  const formatPrice = (value: number) => formatLocalizedPrice(lang, value);
  const [vehicleId, setVehicleId] = useState<TintVehicleId>('gle');
  const [view, setView] = useState<TintView>('side');
  const [selection, setSelection] = useState<TintSelection>({});
  const [ppfSelection, setPpfSelection] = useState<TintPpfSelection>({});
  const [activeWindow, setActiveWindow] = useState<TintWindow | null>(null);
  const [traceMode, setTraceMode] = useState(false);
  const pathEditor = useTintPathEditor();
  const { setActiveWindow: setEditorWindow } = pathEditor;

  const vehicle =
    tintVehicles.find((item) => item.id === vehicleId) ?? tintVehicles[0];
  const entries = getTintSelectionEntries(selection);
  const ppfEntries = getTintPpfEntries(ppfSelection);
  const tintTotal = useMemo(
    () => getTintSelectionTotal(selection, vehicleId),
    [selection, vehicleId]
  );
  const ppfTotal = useMemo(
    () => getTintPpfTotal(ppfSelection, vehicleId),
    [ppfSelection, vehicleId]
  );
  const grandTotal = tintTotal + ppfTotal;

  const viewZones = tintViewZones[view];
  const activeZone = activeWindow
    ? viewZones.find((zone) => zone.window === activeWindow)
    : null;
  const activeMode = activeZone?.mode ?? 'tint';
  const isFrontView = view === 'front';
  const isSideView = view === 'side';
  const isRearView = view === 'rear';

  useEffect(() => {
    setEditorWindow((current) =>
      current && tintViewWindows[view].includes(current) ? current : null
    );
  }, [view, setEditorWindow]);

  function enablePpfZone(zone: TintPpfZone) {
    setPpfSelection((current) => {
      if (current[zone]) {
        return current;
      }
      return { ...current, [zone]: true };
    });
  }

  function selectWindow(window: TintWindow) {
    if (isTintPpfZone(window)) {
      if (ppfSelection[window]) {
        removePpfZone(window);
        return;
      }
      setActiveWindow(window);
      enablePpfZone(window);
      return;
    }

    if (isTintWindowSelected(selection, window)) {
      removeWindow(window);
      return;
    }

    setActiveWindow(window);
  }

  function applyLevel(level: TintLevel) {
    if (!activeWindow || activeMode !== 'tint') {
      return;
    }
    const canonical = resolveTintWindow(activeWindow);
    setSelection((current) => {
      const existing = current[canonical];
      if (existing?.level === level) {
        const next = { ...current };
        delete next[canonical];
        return next;
      }
      return {
        ...current,
        [canonical]: {
          level,
          qty: existing?.qty ?? 1,
        },
      };
    });
  }

  function incrementWindow(window: TintWindow) {
    const canonical = resolveTintWindow(window);
    setSelection((current) => {
      const entry = current[canonical];
      if (!entry?.level) {
        return current;
      }
      const max = getTintMaxQuantity(canonical);
      if (entry.qty >= max) {
        return current;
      }
      return {
        ...current,
        [canonical]: { ...entry, qty: entry.qty + 1 },
      };
    });
  }

  function decrementWindow(window: TintWindow) {
    const canonical = resolveTintWindow(window);
    setSelection((current) => {
      const entry = current[canonical];
      if (!entry || entry.qty <= 0) {
        return current;
      }
      if (entry.qty === 1) {
        const next = { ...current };
        delete next[canonical];
        return next;
      }
      return {
        ...current,
        [canonical]: { ...entry, qty: entry.qty - 1 },
      };
    });
  }

  function togglePpfZone(zone: TintPpfZone) {
    setPpfSelection((current) => {
      const next: TintPpfSelection = { ...current };
      if (next[zone]) {
        delete next[zone];
      } else {
        next[zone] = true;
      }
      return next;
    });
  }

  function removeWindow(window: TintWindow) {
    const canonical = resolveTintWindow(window);
    setSelection((current) => {
      if (!current[canonical]) {
        return current;
      }
      const next = { ...current };
      delete next[canonical];
      return next;
    });
    if (activeWindow && resolveTintWindow(activeWindow) === canonical) {
      setActiveWindow(null);
    }
  }

  function removePpfZone(zone: TintPpfZone) {
    setPpfSelection((current) => {
      if (!current[zone]) {
        return current;
      }
      const next: TintPpfSelection = { ...current };
      delete next[zone];
      return next;
    });
    if (activeWindow === zone) {
      setActiveWindow(null);
    }
  }

  const activeLevel = activeWindow ? getTintLevel(selection, activeWindow) : null;
  const activePpfZone =
    activeWindow && isTintPpfZone(activeWindow) ? activeWindow : null;
  const activePpfOn =
    activePpfZone != null && ppfSelection[activePpfZone] === true;

  const gridWindows = tintViewWindows[view].filter((window, index, list) => {
    const canonical = resolveTintWindow(window);
    return list.findIndex((item) => resolveTintWindow(item) === canonical) === index;
  });

  function tileLabel(window: TintWindow, mode: string) {
    if (mode === 'ppf' && isTintPpfZone(window)) {
      return tintPpfLabels[window];
    }
    return tintWindowLabels[window];
  }

  const viewLegalNote = isFrontView
    ? t.configurator.legalNotes.front
    : isSideView
      ? t.configurator.legalNotes.side
      : t.configurator.legalNotes.rear;

  return (
    <div className="configurator configurator-mockup tint-configurator">
      <div className="viewer">
        <div className="ppf-config-header">
          <div>
            <p className="ppf-config-eyebrow">{t.configurator.tintEyebrow}</p>
            <h2>{t.configurator.tintTitle}</h2>
            <p>{viewLegalNote}</p>
          </div>
          <label className="vehicle-picker ppf-config-picker">
            <span>{t.configurator.selectVehicle}</span>
            <select
              aria-label={t.configurator.selectVehicleAria}
              value={vehicleId}
              onChange={(event) =>
                setVehicleId(event.target.value as TintVehicleId)
              }
            >
              {tintVehicles.map((item) => (
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
            className={'ppf-trace-toggle' + (traceMode ? ' active' : '')}
            aria-pressed={traceMode}
            onClick={() => setTraceMode((current) => !current)}
          >
            {traceMode ? t.configurator.exitSvgEditor : t.configurator.openSvgEditor}
          </button>
        </div>

        <div className="ppf-view-tabs" aria-label={t.configurator.selectView}>
          {(['front', 'side', 'rear'] as TintView[]).map((item) => (
            <button
              key={item}
              type="button"
              aria-label={
                t.configurator.showView + ' ' + t.configurator[tintViewTabKeys[item]]
              }
              className={'ppf-view-tab' + (view === item ? ' active' : '')}
              onClick={() => setView(item)}
            >
              {t.configurator[tintViewTabKeys[item]]}
            </button>
          ))}
        </div>

        <div className="viewerCanvas viewerCanvas-mockup tint-photo-canvas">
          <TintPhotoView
            view={view}
            vehicleName={vehicle.label}
            vehicleId={vehicleId}
            selection={selection}
            ppfSelection={ppfSelection}
            activeWindow={activeWindow}
            onSelectWindow={selectWindow}
            traceMode={traceMode}
            tracePoints={pathEditor.points}
            tracedPaths={pathEditor.savedPaths}
            onTracePoint={pathEditor.addPoint}
          />
        </div>

        {!traceMode && !isFrontView && (
          <p className="tint-research-note tint-research-note-inline">
            {t.configurator.researchNote}
          </p>
        )}

        {traceMode && (
          <TintSvgPathEditorPanel
            windows={tintViewWindows[view]}
            zonesName={tintZoneSnippetNames[view]}
            points={pathEditor.points}
            savedPaths={pathEditor.savedPaths}
            activeWindow={pathEditor.activeWindow}
            setActiveWindow={pathEditor.setActiveWindow}
            lastExported={pathEditor.lastExported}
            onUndo={pathEditor.undoPoint}
            onClear={pathEditor.clearPoints}
            onFinalize={pathEditor.finalizePath}
            onRemoveSaved={pathEditor.removeSavedPath}
            onLoadSaved={pathEditor.loadSavedPath}
          />
        )}

        <div
          className={
            'tint-parts-grid' +
            (traceMode ? ' parts-grid-hidden' : '')
          }
          aria-label={t.configurator.selectWindow}
        >
          {gridWindows.map((window) => {
            const zone = viewZones.find((item) => item.window === window);
            const mode = zone?.mode ?? 'tint';
            const canonical = resolveTintWindow(window);
            const level = getTintLevel(selection, window);
            const qty = getTintQuantity(selection, window);
            const maxQty = getTintMaxQuantity(window);
            const ppfOn =
              isTintPpfZone(window) && ppfSelection[window] === true;
            const active =
              activeWindow != null &&
              resolveTintWindow(activeWindow) === canonical;
            const selected =
              mode === 'ppf' ? ppfOn : isTintWindowSelected(selection, window);

            return (
              <div key={window} className="part-tile-shell tint-part-tile-shell">
                <div
                  className={
                    'part-tile tint-part-tile' +
                    (active ? ' active' : '') +
                    (selected ? ' selected' : '') +
                    (mode === 'ppf' ? ' ppf-tile' : '') +
                    (mode === 'blocked' ? ' blocked' : '')
                  }
                >
                  <button
                    type="button"
                    className="part-tile-hit"
                    aria-pressed={active}
                    onClick={() => selectWindow(window)}
                  >
                    <TintWindowIcon
                      window={window}
                      active={active || selected}
                      level={level}
                      ppfSelected={ppfOn}
                    />
                    <span className="part-tile-label">{tileLabel(window, mode)}</span>
                    {maxQty > 1 && (
                      <span className="part-tile-qty-badge">
                        {qty}/{maxQty}
                      </span>
                    )}
                    {level != null && mode === 'tint' && (
                      <span className="tint-window-badge">
                        {tintLevelShortLabels[level]}
                      </span>
                    )}
                    {mode === 'ppf' && ppfOn && (
                      <span className="tint-window-badge tint-window-badge-ppf">
                        {tintPpfProductLabels[window as TintPpfZone]}
                      </span>
                    )}
                    {mode === 'blocked' && (
                      <span className="tint-window-badge tint-window-badge-blocked">
                        {t.configurator.notPermitted}
                      </span>
                    )}
                    <span
                      className={
                        'part-tooltip part-tile-tooltip' +
                        (mode === 'ppf' ? ' part-tile-tooltip-ppf' : '')
                      }
                      role="tooltip"
                    >
                      <small>{tileLabel(window, mode)}</small>
                      <strong>
                        {mode === 'ppf' && isTintPpfZone(window)
                          ? formatPrice(getTintPpfPrice(window, vehicleId))
                          : level != null
                            ? formatPrice(
                                getTintWindowPrice(window, level, vehicleId)
                              )
                            : t.configurator.tooltipChooseStrength}
                      </strong>
                      <em>
                        {selected
                          ? t.configurator.tooltipSelected
                          : mode === 'ppf'
                            ? tintPpfProductLabels[window as TintPpfZone] +
                              t.configurator.tooltipPpfClick
                            : t.configurator.tooltipClickStrength}
                      </em>
                    </span>
                  </button>
                  {mode === 'tint' && maxQty > 1 ? (
                    <div className="part-qty-controls">
                      <button
                        type="button"
                        className="part-qty-btn"
                        aria-label={'Decrease ' + tintWindowLabels[canonical]}
                        disabled={qty === 0}
                        onClick={() => decrementWindow(window)}
                      >
                        {'\u2212'}
                      </button>
                      <span className="part-qty-value">{qty}</span>
                      <button
                        type="button"
                        className="part-qty-btn"
                        aria-label={'Increase ' + tintWindowLabels[canonical]}
                        disabled={qty >= maxQty || level == null}
                        onClick={() => incrementWindow(window)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    selected &&
                    (mode === 'tint' || mode === 'ppf') && (
                      <button
                        type="button"
                        className="part-tile-remove"
                        aria-label={
                          'Remove ' +
                          (mode === 'ppf'
                            ? tintPpfLabels[window as TintPpfZone]
                            : tintWindowLabels[canonical])
                        }
                        onClick={() =>
                          mode === 'ppf'
                            ? removePpfZone(window as TintPpfZone)
                            : removeWindow(window)
                        }
                      >
                        {'\u00d7'}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!traceMode && activePpfZone && (
          <div className="tint-ppf-panel">
            <div className="tint-level-panel-head">
              <h3>
                {isFrontView
                  ? t.configurator.ppfFrontGlass
                  : isSideView
                    ? t.configurator.ppfHeadlights
                    : t.configurator.ppfTaillights}
              </h3>
              <p>
                {t.configurator.chooseProtectionFor + tintPpfLabels[activePpfZone]}
              </p>
            </div>

            <div className="tint-ppf-options">
              <button
                type="button"
                className={
                  'tint-ppf-option' +
                  (activePpfOn ? ' active' : '')
                }
                aria-pressed={activePpfOn}
                onClick={() => togglePpfZone(activePpfZone)}
              >
                <strong>{tintPpfProductLabels[activePpfZone]}</strong>
                <small>
                  {activePpfZone === 'windscreenStrip'
                    ? t.configurator.ppfWindscreenStrip
                    : activePpfOn
                      ? t.configurator.tooltipSelected
                      : t.configurator.ppfAutoSelect}
                </small>
                <em>{formatPrice(getTintPpfPrice(activePpfZone, vehicleId))}</em>
              </button>
            </div>
          </div>
        )}

        <div
          className={
            'tint-level-panel tint-vlt-panel' +
            (traceMode || isFrontView ? ' parts-grid-hidden' : '')
          }
        >
          <div className="tint-level-panel-head">
            <h3>{t.configurator.tintStrength}</h3>
            <p>
              {activeWindow && activeMode === 'tint'
                ? t.configurator.chooseStrengthFor +
                  tintWindowLabels[activeWindow]
                : t.configurator.selectWindowFirst}
            </p>
          </div>
          <div className="tint-vlt-grid">
            {tintLevels.map((level) => (
              <TintVltCard
                key={level}
                level={level}
                levelLabel={tintLevelLabels[level]}
                active={activeLevel === level}
                disabled={!activeWindow || activeMode !== 'tint'}
                price={
                  activeWindow
                    ? getTintWindowPrice(activeWindow, level, vehicleId)
                    : getTintWindowPrice('rearWindow', level, vehicleId)
                }
                formatPrice={formatPrice}
                onClick={() => applyLevel(level)}
              />
            ))}
          </div>
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
              onChange={(event) =>
                setVehicleId(event.target.value as TintVehicleId)
              }
            >
              {tintVehicles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="tint-summary-meta">
            <small>
              {
                t.configurator.vehicles[
                  vehicleId as keyof typeof t.configurator.vehicles
                ]?.kind
              }
            </small>
            <p>{t.configurator.tintSummaryNote}</p>
          </div>

          <div className="tint-price-guide">
            <h4>{t.configurator.priceGuide.title}</h4>
            <ul>
              {tintPriceGuide.map((item) => {
                const copy = t.configurator.priceGuide[item.id];
                const note =
                  item.id === 'small'
                    ? t.configurator.priceGuide.smallNote
                    : item.id === 'large'
                      ? t.configurator.priceGuide.largeExample
                      : t.configurator.priceGuide.dechromeNote;
                const priceLabel =
                  item.id === 'small'
                    ? formatPrice(item.price) +
                      ' ' +
                      t.configurator.priceGuide.smallPriceSuffix
                    : formatPrice(item.price);
                return (
                  <li key={item.id}>
                    <span>
                      <strong>{copy}</strong>
                      <small>{note}</small>
                    </span>
                    <em>{priceLabel}</em>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="summaryDivider" />

          {entries.length === 0 && ppfEntries.length === 0 ? (
            <div className="empty-state">
              <span>+</span>
              <p>{t.configurator.emptyTint.title}</p>
              <small>{t.configurator.emptyTint.hint}</small>
            </div>
          ) : (
            <div className="selected-parts">
              {ppfEntries.map((zone) => {
                const lineTotal = getTintPpfPrice(zone, vehicleId);
                return (
                  <div key={'ppf-' + zone} className="summaryRow">
                    <span>
                      <i aria-hidden="true" /> {tintPpfLabels[zone]}
                      <small className="tint-summary-level">
                        {' '}
                        {'\u00b7 ' + tintPpfProductLabels[zone]}
                      </small>
                    </span>
                    <div className="summaryRow-actions">
                      <strong>{formatPrice(lineTotal)}</strong>
                      <button
                        type="button"
                        className="summaryRow-remove"
                        aria-label={t.configurator.tooltipSelected + ' ' + tintPpfLabels[zone]}
                        onClick={() => removePpfZone(zone)}
                      >
                        {'\u00d7'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {entries.map(([window, level, qty]) => {
                const lineTotal =
                  getTintWindowPrice(window, level, vehicleId) * qty;
                const maxQty = getTintMaxQuantity(window);
                return (
                  <div key={window} className="summaryRow">
                    <span>
                      <i aria-hidden="true" /> {tintWindowLabels[window]}
                      {maxQty > 1 && qty > 1 && (
                        <small className="tint-summary-level">
                          {' '}
                          {'\u00b7 ' + qty + '/2'}
                        </small>
                      )}
                      <small className="tint-summary-level">
                        {' '}
                        {'\u00b7 ' + tintLevelShortLabels[level]}
                      </small>
                    </span>
                    <div className="summaryRow-actions">
                      <strong>{formatPrice(lineTotal)}</strong>
                      <button
                        type="button"
                        className="summaryRow-remove"
                        aria-label={t.configurator.tooltipSelected + ' ' + tintWindowLabels[window]}
                        onClick={() => removeWindow(window)}
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
            <h2>{formatPrice(grandTotal)}</h2>
          </div>
          <a href="/#contact" className="configurator-cta configurator-cta-mockup">
            {t.configurator.getQuote}
          </a>
        </div>
      </aside>
    </div>
  );
}
