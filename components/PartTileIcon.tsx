import { Part } from './carParts';
import { partIconPaths } from './partIconPaths';

type Props = {
  part: Part;
  active?: boolean;
};

export function PartTileIcon({ part, active = false }: Props) {
  const icon = partIconPaths[part];

  return (
    <svg
      className={'part-tile-icon-svg' + (active ? ' active' : '')}
      viewBox={icon.viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path className="part-tile-icon-path" d={icon.d} />
    </svg>
  );
}
