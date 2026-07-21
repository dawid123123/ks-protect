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
  | 'splashGuard'
  | 'rightSplashGuard'
  | 'frontDoorLower'
  | 'rightFrontDoorLower'
  | 'rearDoorLower'
  | 'rightRearDoorLower'
  | 'frontWheelArch'
  | 'rearWheelArch'
  | 'rightFrontWheelArch'
  | 'rightRearWheelArch'
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

import { getLivePricing } from '../lib/pricingRuntime';

export const partPrices: Record<Part, number> = new Proxy(
  {} as Record<Part, number>,
  {
    get(_target, prop: string) {
      const prices = getLivePricing().ppfPartPrices;
      return prices[prop as keyof typeof prices] ?? 0;
    },
    ownKeys() {
      return Reflect.ownKeys(getLivePricing().ppfPartPrices);
    },
    getOwnPropertyDescriptor(_target, prop) {
      return {
        configurable: true,
        enumerable: true,
        value: getLivePricing().ppfPartPrices[
          prop as keyof ReturnType<typeof getLivePricing>['ppfPartPrices']
        ],
      };
    },
  }
);

export type SelectedParts = Partial<Record<Part, number>>;

/** Pairs of left/right zones that share one list row and quantity. */
export const partZoneAliases: Partial<Record<Part, Part>> = {
  rightFender: 'leftFender',
  rightRearQuarter: 'leftRearQuarter',
  rightBPillar: 'leftBPillar',
  rightCPillar: 'leftCPillar',
  rightFrontWheelArch: 'frontWheelArch',
  rightRearWheelArch: 'rearWheelArch',
  rightSplashGuard: 'splashGuard',
  rightFrontDoorLower: 'frontDoorLower',
  rightRearDoorLower: 'rearDoorLower',
};

export const partMaxQuantity: Partial<Record<Part, number>> = {
  frontDoor: 2,
  rearDoor: 2,
  sideSkirt: 2,
  splashGuard: 2,
  frontDoorLower: 2,
  rearDoorLower: 2,
  frontWheelArch: 2,
  rearWheelArch: 2,
  leftFender: 2,
  leftRearQuarter: 2,
  leftBPillar: 2,
  leftCPillar: 2,
};

/** Parts hidden from the PPF editor (still priced for tint / reference). */
export const ppfEditorExcludedParts: Part[] = [
  'rearWindow',
  'leftHeadlight',
  'rightHeadlight',
  'leftTaillight',
  'rightTaillight',
];

export type PpfCatalogSectionId = 'front' | 'side' | 'rear';

/** PPF catalog grouped by car view: front → side → rear. */
export const ppfCatalogSections: {
  id: PpfCatalogSectionId;
  parts: Part[];
}[] = [
  {
    id: 'front',
    parts: [
      'hood',
      'frontBumper',
      'frontLip',
      'leftMirror',
      'rightMirror',
      'leftAPillar',
      'rightAPillar',
    ],
  },
  {
    id: 'side',
    parts: [
      'leftFender',
      'frontDoor',
      'rearDoor',
      'leftBPillar',
      'leftCPillar',
      'splashGuard',
      'frontDoorLower',
      'rearDoorLower',
      'sideSkirt',
      'frontWheelArch',
      'rearWheelArch',
      'leftRearQuarter',
    ],
  },
  {
    id: 'rear',
    parts: ['roof', 'tailgate', 'rearBumper'],
  },
];

/** All selectable parts in the configurator list (canonical ids only, no zone aliases). */
export const catalogParts: Part[] = ppfCatalogSections.flatMap(
  (section) => section.parts
);

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
  splashGuard: 'Splash Guard',
  rightSplashGuard: 'Splash Guard',
  frontDoorLower: 'Front Door Lower',
  rightFrontDoorLower: 'Front Door Lower',
  rearDoorLower: 'Rear Door Lower',
  rightRearDoorLower: 'Rear Door Lower',
  frontWheelArch: 'Front Wheel Arch',
  rearWheelArch: 'Rear Wheel Arch',
  rightFrontWheelArch: 'Front Wheel Arch',
  rightRearWheelArch: 'Rear Wheel Arch',
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
