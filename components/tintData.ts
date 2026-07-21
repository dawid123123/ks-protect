import { getLivePricing } from '../lib/pricingRuntime';
import {
  FrontPpfSelection,
  FrontPpfZone,
  TintLevel,
  TintLineSelection,
  TintPpfSelection,
  TintPpfZone,
  TintSelection,
  TintVehicleId,
  TintWindow,
} from './tintTypes';

/** VLT % - lower value = darker tint (5% is darkest). */
export const tintLevels: TintLevel[] = [5, 15, 25, 50];

export const tintLevelLabels: Record<TintLevel, string> = {
  5: '5% VLT \u00b7 Darkest',
  15: '15% VLT \u00b7 Dark',
  25: '25% VLT \u00b7 Medium',
  50: '50% VLT \u00b7 Lightest',
};

export const tintLevelShortLabels: Record<TintLevel, string> = {
  5: '5%',
  15: '15%',
  25: '25%',
  50: '50%',
};

export const tintWindowLabels: Record<TintWindow, string> = {
  windscreenStrip: 'Windscreen Strip',
  frontLeft: 'Front Window',
  frontRight: 'Right Front Window',
  leftHeadlight: 'Left Headlight',
  rightHeadlight: 'Right Headlight',
  leftTaillight: 'Left Taillight',
  rightTaillight: 'Right Taillight',
  rearLeft: 'Rear Window',
  rearRight: 'Right Rear Window',
  rearWindow: 'Rear Window',
};

/** Windows that accept tint VLT (not front windshield / headlights). */
export const tintableWindows: TintWindow[] = [
  'frontLeft',
  'rearLeft',
  'rearWindow',
];

export const tintPpfLabels: Record<TintPpfZone, string> = {
  windscreenStrip: 'Windscreen Strip',
  leftHeadlight: 'Left Headlight',
  rightHeadlight: 'Right Headlight',
  leftTaillight: 'Left Taillight',
  rightTaillight: 'Right Taillight',
};

/** @deprecated Use tintPpfLabels */
export const frontPpfLabels = tintPpfLabels;

export const tintPpfProductLabels: Record<TintPpfZone, string> = {
  windscreenStrip: 'PPF Protection',
  leftHeadlight: 'Dark PPF',
  rightHeadlight: 'Dark PPF',
  leftTaillight: 'Dark PPF',
  rightTaillight: 'Dark PPF',
};

/** @deprecated Use tintPpfProductLabels */
export const frontPpfProductLabels = tintPpfProductLabels;

export const frontLegalNote =
  'Tint on front windows and the windscreen is not permitted. Only PPF protection on the windscreen strip and dark PPF on the left and right headlights.';

export const sideLegalNote =
  'Choose tint strength for front and rear side windows. Select headlights in FRONT VIEW.';

export const rearLegalNote =
  'Choose dark PPF on the taillights and tint strength on the rear window (5\u201350% VLT).';

export const tintWindows: TintWindow[] = tintableWindows;

/** Left/right pairs share one tile and quantity (1 = left only, 2 = both sides). */
export const tintWindowAliases: Partial<Record<TintWindow, TintWindow>> = {
  frontRight: 'frontLeft',
  rearRight: 'rearLeft',
};

export const tintWindowMaxQuantity: Partial<Record<TintWindow, number>> = {
  frontLeft: 2,
  rearLeft: 2,
};

export function resolveTintWindow(window: TintWindow): TintWindow {
  return tintWindowAliases[window] ?? window;
}

export function getTintMaxQuantity(window: TintWindow): number {
  return tintWindowMaxQuantity[resolveTintWindow(window)] ?? 1;
}

export function getTintQuantity(
  selection: TintSelection,
  window: TintWindow
): number {
  return selection[resolveTintWindow(window)]?.qty ?? 0;
}

export function getTintLevel(
  selection: TintSelection,
  window: TintWindow
): TintLevel | null {
  return selection[resolveTintWindow(window)]?.level ?? null;
}

export function isTintWindowSelected(
  selection: TintSelection,
  window: TintWindow
): boolean {
  return getTintQuantity(selection, window) > 0;
}

export function isTintZoneActive(
  selection: TintSelection,
  window: TintWindow
): boolean {
  const canonical = resolveTintWindow(window);
  const entry = selection[canonical];
  if (!entry || entry.qty <= 0) {
    return false;
  }
  if (window === canonical) {
    return entry.qty >= 1;
  }
  return entry.qty >= 2;
}

export function isTintPpfZone(window: TintWindow): window is TintPpfZone {
  return (
    window === 'windscreenStrip' ||
    window === 'leftHeadlight' ||
    window === 'rightHeadlight' ||
    window === 'leftTaillight' ||
    window === 'rightTaillight'
  );
}

/**
 * Base install price per window (ISK, GLE/SUV reference).
 * Research: within the same film line, VLT darkness rarely changes material cost;
 * darker levels often use premium ceramic - we add a modest premium for 5-15%.
 */
function baseWindowPrices(): Record<TintWindow, number> {
  return getLivePricing().tintWindowBasePrices;
}

function vehicleSizeMultipliers(): Record<TintVehicleId, number> {
  return getLivePricing().tintVehicleSizeMultipliers;
}

export function getTintPpfPrice(
  zone: TintPpfZone,
  vehicleId: TintVehicleId = 'gle'
): number {
  const vehicleFactor = vehicleSizeMultipliers()[vehicleId] ?? 1;
  return (
    Math.round(
      (getLivePricing().tintPpfBasePrices[zone] * vehicleFactor) / 100
    ) * 100
  );
}

/** @deprecated Use getTintPpfPrice */
export const getFrontPpfPrice = getTintPpfPrice;

export function getTintPpfEntries(
  selection: TintPpfSelection
): TintPpfZone[] {
  return (Object.keys(selection) as TintPpfZone[]).filter(
    (zone) => selection[zone]
  );
}

/** @deprecated Use getTintPpfEntries */
export const getFrontPpfEntries = getTintPpfEntries;

export function getTintPpfTotal(
  selection: TintPpfSelection,
  vehicleId: TintVehicleId = 'gle'
): number {
  return getTintPpfEntries(selection).reduce(
    (sum, zone) => sum + getTintPpfPrice(zone, vehicleId),
    0
  );
}

/** @deprecated Use getTintPpfTotal */
export const getFrontPpfTotal = getTintPpfTotal;

export const tintVehicles: {
  id: TintVehicleId;
  label: string;
  kind: string;
}[] = [
  { id: 'gle', label: 'Mercedes-Benz GLE', kind: 'SUV \u00b7 JEEP' },
  { id: 'cla', label: 'Mercedes-Benz CLA', kind: 'SPORT SEDAN' },
  { id: 'cclass', label: 'Mercedes-Benz C-Class', kind: 'SEDAN' },
  { id: 'eclass', label: 'Mercedes-Benz E-Class', kind: 'EXECUTIVE SEDAN' },
  { id: 'gclass', label: 'Mercedes-Benz G-Class', kind: 'SUV \u00b7 4X4' },
  { id: 'amggt', label: 'Mercedes-AMG GT', kind: 'COUP\u00c9 \u00b7 2 DOOR' },
];

export function getTintWindowPrice(
  window: TintWindow,
  level: TintLevel,
  vehicleId: TintVehicleId = 'gle'
): number {
  const base = baseWindowPrices()[window];
  const levelFactor = getLivePricing().tintLevelMultipliers[level];
  const vehicleFactor = vehicleSizeMultipliers()[vehicleId] ?? 1;
  return Math.round((base * levelFactor * vehicleFactor) / 100) * 100;
}

export function getTintSelectionEntries(
  selection: TintSelection
): [TintWindow, TintLevel, number][] {
  return Object.entries(selection)
    .filter((entry): entry is [TintWindow, TintLineSelection] => {
      const line = entry[1];
      return line != null && line.qty > 0;
    })
    .map(([window, line]) => [window as TintWindow, line.level, line.qty]);
}

export function getTintSelectionTotal(
  selection: TintSelection,
  vehicleId: TintVehicleId = 'gle'
): number {
  return getTintSelectionEntries(selection).reduce(
    (sum, [window, level, qty]) =>
      sum + getTintWindowPrice(window, level, vehicleId) * qty,
    0
  );
}

/** CSS overlay opacity from VLT (5 = darkest). */
export function tintOverlayOpacity(level: TintLevel): number {
  return Math.min(0.92, Math.max(0.08, (100 - level) / 100));
}

export type TintPpfVisualKind = 'headlight' | 'taillight' | 'strip';

export function getTintPpfVisualKind(zone: TintPpfZone): TintPpfVisualKind {
  if (zone === 'leftHeadlight' || zone === 'rightHeadlight') {
    return 'headlight';
  }
  if (zone === 'leftTaillight' || zone === 'rightTaillight') {
    return 'taillight';
  }
  return 'strip';
}

/** Photo/tile overlay fill for selected PPF zones. */
export function tintPpfOverlayFill(zone: TintPpfZone): string {
  const kind = getTintPpfVisualKind(zone);
  if (kind === 'headlight' || kind === 'taillight') {
    return 'rgba(8, 12, 18, 0.58)';
  }
  return 'rgba(120, 180, 255, 0.28)';
}

export const tintResearchNote =
  'Research: within the same film line, price usually changes little with darkness (VLT). Darker levels (5\u201315%) carry a modest premium for premium ceramic film and enhanced heat rejection.';

export type TintPriceGuideId = 'small' | 'large' | 'dechrome';

export function getTintPriceGuide(): {
  id: TintPriceGuideId;
  price: number;
}[] {
  const amounts = getLivePricing().tintPriceGuideAmounts;
  return [
    { id: 'small', price: amounts.small },
    { id: 'large', price: amounts.large },
    { id: 'dechrome', price: amounts.dechrome },
  ];
}

/** @deprecated Prefer getTintPriceGuide() for live boss pricing */
export const tintPriceGuide = getTintPriceGuide();
