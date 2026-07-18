'use client';

import { tintOverlayOpacity } from './tintData';
import { tintIconPaths } from './tintIconPaths';
import { TintLevel, TintWindow } from './tintTypes';

type Props = {
  window: TintWindow;
  active?: boolean;
  level?: TintLevel | null;
  ppfSelected?: boolean;
};

export function TintWindowIcon({
  window,
  active = false,
  level = null,
  ppfSelected = false,
}: Props) {
  const icon = tintIconPaths[window];
  const isPpf = icon.accent === 'ppf';
  const selected = isPpf ? ppfSelected : level != null;
  const ppfKind = icon.ppfKind ?? 'strip';

  return (
    <span
      className={
        'tint-tile-icon-wrap' +
        (active ? ' active' : '') +
        (selected ? ' selected' : '') +
        (isPpf ? ' ppf ppf-' + ppfKind : ' tint')
      }
    >
      <svg
        className="tint-tile-icon-svg"
        viewBox={icon.viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path className="tint-tile-icon-path" d={icon.d} />
        {!isPpf && level != null && (
          <path
            className="tint-tile-icon-fill"
            d={icon.d}
            style={{ fill: `rgba(8, 12, 18, ${tintOverlayOpacity(level)})` }}
          />
        )}
        {isPpf && ppfSelected && (
          <path
            className={'tint-tile-icon-fill ppf ppf-' + ppfKind}
            d={icon.d}
          />
        )}
      </svg>
    </span>
  );
}
