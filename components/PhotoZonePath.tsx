'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Part, partLabels, partPrices, SelectedParts, isZoneActive, resolvePart } from './carParts';

export type PhotoZone = {
  part: Part;
  label: string;
  d: string;
  fillRule?: 'evenodd' | 'nonzero';
};

export function boxPath(
  left: number,
  top: number,
  width: number,
  height: number
) {
  const format = (value: number) => (Math.round(value * 10) / 10).toFixed(1);
  const right = left + width;
  const bottom = top + height;
  return `M ${format(left)},${format(top)} L ${format(right)},${format(top)} L ${format(right)},${format(bottom)} L ${format(left)},${format(bottom)} Z`;
}

export function PhotoZonePath({
  zone,
  selected,
  toggle,
}: {
  zone: PhotoZone;
  selected: SelectedParts;
  toggle: (part: Part) => void;
}) {
  const active = isZoneActive(selected, zone.part);
  const canonical = resolvePart(zone.part);
  const [hover, setHover] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const priceLabel =
    partLabels[canonical] +
    ' - ' +
    partPrices[canonical].toLocaleString('is-IS') +
    ' kr.';

  return (
    <>
      <g className={'front-zone-group' + (active ? ' active' : '') + (hover ? ' is-hovering' : '')}>
        <path
          className="front-zone-path"
          d={zone.d}
          fillRule={zone.fillRule}
          role="button"
          aria-pressed={active}
          aria-label={priceLabel}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onMouseMove={(event) => {
            setCoords({ x: event.clientX, y: event.clientY });
          }}
          onClick={(event) => {
            toggle(zone.part);
            event.currentTarget.blur();
          }}
        />
      </g>
      {hover &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="part-tooltip zone-hover-tooltip zone-hover-tooltip-ppf"
            style={{ left: coords.x, top: coords.y }}
            role="tooltip"
          >
            <small>{partLabels[canonical]}</small>
            <strong>
              {partPrices[canonical].toLocaleString('is-IS')} kr.
            </strong>
            <em>
              {active
                ? 'Selected \u00b7 click to remove'
                : 'Click to select'}
            </em>
          </div>,
          document.body
        )}
    </>
  );
}
