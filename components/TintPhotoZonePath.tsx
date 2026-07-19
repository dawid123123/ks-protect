'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getTintPpfPrice,
  getTintLevel,
  getTintQuantity,
  getTintWindowPrice,
  getTintPpfVisualKind,
  isTintPpfZone,
  isTintZoneActive,
  resolveTintWindow,
  tintLevelShortLabels,
  tintOverlayOpacity,
  tintPpfLabels,
  tintPpfOverlayFill,
  tintPpfProductLabels,
  tintWindowLabels,
} from './tintData';
import {
  TintLevel,
  TintPpfSelection,
  TintPpfZone,
  TintSelection,
  TintVehicleId,
  TintWindow,
} from './tintTypes';
import { TintPhotoZone } from './tintPhotoZones';

function getTintHoverFill(
  mode: string,
  ppfZone: TintPpfZone | null,
  ppfOn: boolean,
  level: TintLevel | null
): string {
  if (mode === 'ppf' && ppfZone) {
    if (ppfOn) {
      return tintPpfOverlayFill(ppfZone);
    }
    if (ppfZone === 'windscreenStrip') {
      return 'rgba(120, 180, 255, 0.24)';
    }
    return 'rgba(8, 12, 18, 0.42)';
  }
  if (level != null) {
    return `rgba(8, 12, 18, ${Math.min(0.88, tintOverlayOpacity(level) + 0.08)})`;
  }
  return 'rgba(183, 245, 54, 0.22)';
}

export function TintPhotoZonePath({
  zone,
  selection,
  ppfSelection,
  activeWindow,
  vehicleId,
  onSelectWindow,
}: {
  zone: TintPhotoZone;
  selection: TintSelection;
  ppfSelection: TintPpfSelection;
  activeWindow: TintWindow | null;
  vehicleId: TintVehicleId;
  onSelectWindow: (window: TintWindow) => void;
}) {
  const mode = zone.mode ?? 'tint';
  const level = getTintLevel(selection, zone.window);
  const qty = getTintQuantity(selection, zone.window);
  const ppfZone = mode === 'ppf' && isTintPpfZone(zone.window) ? zone.window : null;
  const ppfOn = ppfZone != null && ppfSelection[ppfZone] === true;
  const active = isTintPpfZone(zone.window)
    ? activeWindow === zone.window
    : activeWindow != null &&
      resolveTintWindow(activeWindow) === resolveTintWindow(zone.window);
  const selected =
    mode === 'tint'
      ? isTintZoneActive(selection, zone.window)
      : mode === 'ppf'
        ? ppfOn
        : false;
  const blocked = mode === 'blocked';
  const [hover, setHover] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  let priceHint = 'Choose strength below';
  if (blocked) {
    priceHint = 'Tint not permitted on front windows \u00b7 select from side view';
  } else if (mode === 'ppf' && ppfZone) {
    priceHint =
      getTintPpfPrice(ppfZone, vehicleId).toLocaleString('is-IS') +
      ' kr. \u00b7 ' +
      tintPpfProductLabels[ppfZone];
  } else if (level != null) {
    priceHint =
      getTintWindowPrice(zone.window, level, vehicleId).toLocaleString('is-IS') +
      ' kr.';
    if (qty > 1) {
      priceHint += ' \u00b7 ' + qty + '/2';
    }
  }

  const label =
    mode === 'ppf' && ppfZone
      ? tintPpfLabels[ppfZone]
      : tintWindowLabels[zone.window];

  let fill: string | undefined;
  if (mode === 'ppf' && ppfOn && ppfZone) {
    fill = tintPpfOverlayFill(ppfZone);
  } else if (mode === 'tint' && level != null) {
    fill = `rgba(8, 12, 18, ${tintOverlayOpacity(level)})`;
  } else if (blocked) {
    fill = 'rgba(255, 80, 80, 0.08)';
  }

  const displayFill =
    hover && !blocked ? getTintHoverFill(mode, ppfZone, ppfOn, level) : fill;

  const actionHint = selected
    ? 'Selected \u00b7 click to remove'
    : mode === 'ppf' && ppfZone
      ? tintPpfProductLabels[ppfZone] + ' \u00b7 click to select'
      : 'Click to choose strength';

  return (
    <>
      <g
        className={
          'tint-zone-group' +
          (hover ? ' is-hovering' : '') +
          (selected ? ' selected' : '') +
          (active ? ' active' : '') +
          (mode === 'ppf' && ppfOn ? ' ppf-selected' : '') +
          (ppfZone && ppfOn ? ' ppf-' + getTintPpfVisualKind(ppfZone) : '') +
          (mode === 'ppf' ? ' ppf-mode' : '') +
          (blocked ? ' blocked' : '')
        }
      >
        <path
          className="front-zone-path tint-zone-path"
          d={zone.d}
          fillRule={zone.fillRule}
          role="button"
          aria-pressed={selected}
          aria-disabled={blocked}
          aria-label={label + ' \u2014 ' + priceHint}
          style={{ fill: displayFill }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onMouseMove={(event) => {
            setCoords({ x: event.clientX + 24, y: event.clientY });
          }}
          onClick={(event) => {
            onSelectWindow(zone.window);
            event.currentTarget.blur();
          }}
        />
      </g>
      {hover &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={
              'part-tooltip zone-hover-tooltip' +
              (mode === 'ppf' ? ' zone-hover-tooltip-ppf' : ' zone-hover-tooltip-tint')
            }
            style={{ left: coords.x, top: coords.y }}
            role="tooltip"
          >
            <small>{label}</small>
            <strong>{priceHint}</strong>
            {mode === 'tint' && level != null && (
              <em>{tintLevelShortLabels[level as TintLevel]} VLT</em>
            )}
            <em>{actionHint}</em>
          </div>,
          document.body
        )}
    </>
  );
}
