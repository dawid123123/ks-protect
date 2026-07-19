import { Part, resolvePart } from './carParts';
import { partIconPaths } from './partIconPaths';

type Props = {
  part: Part;
  active?: boolean;
};

export function PartTileIcon({ part, active = false }: Props) {
  const icon = partIconPaths[resolvePart(part)] ?? partIconPaths.hood;

  return (
    <span
      className={
        'tint-tile-icon-wrap tint' + (active ? ' active selected' : '')
      }
    >
      <svg
        className="tint-tile-icon-svg"
        viewBox={icon.viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path className="tint-tile-icon-path" d={icon.d} />
        {active && (
          <path
            className="tint-tile-icon-fill"
            d={icon.d}
            style={{ fill: 'rgba(185, 245, 66, 0.2)' }}
          />
        )}
      </svg>
    </span>
  );
}
