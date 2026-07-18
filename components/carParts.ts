export type Part =
  | 'hood'
  | 'roof'
  | 'rearWindow'
  | 'frontBumper'
  | 'rearBumper'
  | 'frontLip'
  | 'leftHeadlight'
  | 'rightHeadlight'
  | 'leftMirror'
  | 'rightMirror'
  | 'leftFender'
  | 'rightFender'
  | 'frontDoor'
  | 'rearDoor'
  | 'sideSkirt'
  | 'leftRearQuarter'
  | 'rightRearQuarter'
  | 'tailgate'
  | 'leftTaillight'
  | 'rightTaillight'
  | 'leftAPillar'
  | 'rightAPillar'
  | 'leftBPillar'
  | 'rightBPillar'
  | 'leftCPillar'
  | 'rightCPillar';

export const partPrices: Record<Part, number> = {
  hood: 109900,
  roof: 89900,
  rearWindow: 44900,
  frontBumper: 89900,
  rearBumper: 89900,
  frontLip: 44900,
  leftHeadlight: 29900,
  rightHeadlight: 29900,
  leftMirror: 19900,
  rightMirror: 19900,
  leftFender: 59900,
  rightFender: 59900,
  frontDoor: 69900,
  rearDoor: 69900,
  sideSkirt: 49900,
  leftRearQuarter: 59900,
  rightRearQuarter: 59900,
  tailgate: 79900,
  leftTaillight: 29900,
  rightTaillight: 29900,
  leftAPillar: 24900,
  rightAPillar: 24900,
  leftBPillar: 29900,
  rightBPillar: 29900,
  leftCPillar: 24900,
  rightCPillar: 24900,
};

export type SelectedParts = Partial<Record<Part, number>>;

/** Pairs of left/right zones that share one list row and quantity. */
export const partZoneAliases: Partial<Record<Part, Part>> = {
  rightFender: 'leftFender',
  rightRearQuarter: 'leftRearQuarter',
  rightBPillar: 'leftBPillar',
  rightCPillar: 'leftCPillar',
};

export const partMaxQuantity: Partial<Record<Part, number>> = {
  frontDoor: 2,
  rearDoor: 2,
  sideSkirt: 2,
  leftFender: 2,
  leftRearQuarter: 2,
  leftBPillar: 2,
  leftCPillar: 2,
};

/** All selectable parts in the configurator list (canonical ids only, no zone aliases). */
export const catalogParts: Part[] = [
  'hood',
  'roof',
  'frontBumper',
  'frontLip',
  'leftHeadlight',
  'rightHeadlight',
  'leftMirror',
  'rightMirror',
  'leftAPillar',
  'rightAPillar',
  'leftFender',
  'frontDoor',
  'rearDoor',
  'sideSkirt',
  'leftBPillar',
  'leftCPillar',
  'rearWindow',
  'tailgate',
  'leftTaillight',
  'rightTaillight',
  'rearBumper',
  'leftRearQuarter',
];

export function resolvePart(part: Part): Part {
  return partZoneAliases[part] ?? part;
}

export function getPartMaxQuantity(part: Part): number {
  return partMaxQuantity[resolvePart(part)] ?? 1;
}

export function getPartQuantity(
  selected: SelectedParts,
  part: Part
): number {
  return selected[resolvePart(part)] ?? 0;
}

export function isPartSelected(
  selected: SelectedParts,
  part: Part
): boolean {
  return getPartQuantity(selected, part) > 0;
}

export function isZoneActive(selected: SelectedParts, part: Part): boolean {
  const canonical = resolvePart(part);
  const qty = getPartQuantity(selected, canonical);
  if (qty <= 0) {
    return false;
  }
  if (part === canonical) {
    return qty >= 1;
  }
  return qty >= 2;
}

export function partsToSelection(parts: Part[]): SelectedParts {
  const selected: SelectedParts = {};
  for (const part of parts) {
    const canonical = resolvePart(part);
    const max = getPartMaxQuantity(canonical);
    const current = selected[canonical] ?? 0;
    selected[canonical] = Math.min(max, current + 1);
  }
  return selected;
}

export function getSelectedEntries(
  selected: SelectedParts
): [Part, number][] {
  const merged: SelectedParts = {};
  for (const [part, qty] of Object.entries(selected)) {
    if ((qty ?? 0) <= 0) {
      continue;
    }
    const canonical = resolvePart(part as Part);
    merged[canonical] = Math.max(merged[canonical] ?? 0, qty ?? 0);
  }
  return Object.entries(merged)
    .filter((entry): entry is [Part, number] => (entry[1] ?? 0) > 0)
    .map(([part, qty]) => [part as Part, qty]);
}

export function getSelectedTotal(selected: SelectedParts): number {
  return getSelectedEntries(selected).reduce(
    (sum, [part, qty]) => sum + partPrices[part] * qty,
    0
  );
}

export const partLabels: Record<Part, string> = {
  hood: 'Hood',
  roof: 'Roof',
  rearWindow: 'Rear Window',
  frontBumper: 'Front Bumper',
  rearBumper: 'Rear Bumper',
  frontLip: 'Front Lip',
  leftHeadlight: 'Left Headlight',
  rightHeadlight: 'Right Headlight',
  leftMirror: 'Left Mirror',
  rightMirror: 'Right Mirror',
  leftFender: 'Front Fender',
  rightFender: 'Front Fender',
  frontDoor: 'Front Door',
  rearDoor: 'Rear Door',
  sideSkirt: 'Side Skirt',
  leftRearQuarter: 'Rear Quarter Panel',
  rightRearQuarter: 'Rear Quarter Panel',
  tailgate: 'Tailgate',
  leftTaillight: 'Left Taillight',
  rightTaillight: 'Right Taillight',
  leftAPillar: 'Left A-Pillar',
  rightAPillar: 'Right A-Pillar',
  leftBPillar: 'Door B-Pillar',
  rightBPillar: 'Door B-Pillar',
  leftCPillar: 'C-Pillar',
  rightCPillar: 'C-Pillar',
};
