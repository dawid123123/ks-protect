import {
  ppfPartPrices,
  tintLevelMultipliers,
  tintPpfBasePrices,
  tintPriceGuideAmounts,
  tintVehicleSizeMultipliers,
  tintWindowBasePrices,
} from './pricing';

export type PricingOverrides = {
  ppfPartPrices?: Partial<Record<keyof typeof ppfPartPrices, number>>;
  tintWindowBasePrices?: Partial<Record<keyof typeof tintWindowBasePrices, number>>;
  tintPpfBasePrices?: Partial<Record<keyof typeof tintPpfBasePrices, number>>;
  tintPriceGuideAmounts?: Partial<Record<keyof typeof tintPriceGuideAmounts, number>>;
  tintLevelMultipliers?: Partial<Record<keyof typeof tintLevelMultipliers, number>>;
  tintVehicleSizeMultipliers?: Partial<
    Record<keyof typeof tintVehicleSizeMultipliers, number>
  >;
};

export type LivePricing = {
  ppfPartPrices: Record<keyof typeof ppfPartPrices, number>;
  tintWindowBasePrices: Record<keyof typeof tintWindowBasePrices, number>;
  tintPpfBasePrices: Record<keyof typeof tintPpfBasePrices, number>;
  tintPriceGuideAmounts: Record<keyof typeof tintPriceGuideAmounts, number>;
  tintLevelMultipliers: Record<keyof typeof tintLevelMultipliers, number>;
  tintVehicleSizeMultipliers: Record<
    keyof typeof tintVehicleSizeMultipliers,
    number
  >;
};

function cloneDefaults(): LivePricing {
  return {
    ppfPartPrices: { ...ppfPartPrices },
    tintWindowBasePrices: { ...tintWindowBasePrices },
    tintPpfBasePrices: { ...tintPpfBasePrices },
    tintPriceGuideAmounts: { ...tintPriceGuideAmounts },
    tintLevelMultipliers: { ...tintLevelMultipliers },
    tintVehicleSizeMultipliers: { ...tintVehicleSizeMultipliers },
  };
}

let livePricing = cloneDefaults();

export function getLivePricing(): LivePricing {
  return livePricing;
}

export function mergePricingOverrides(
  overrides?: PricingOverrides | null
): LivePricing {
  const next = cloneDefaults();
  if (!overrides) {
    return next;
  }

  (Object.entries(overrides.ppfPartPrices || {}) as [keyof typeof ppfPartPrices, number][]).forEach(
    ([key, value]) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        next.ppfPartPrices[key] = Math.round(value);
      }
    }
  );

  (
    Object.entries(overrides.tintWindowBasePrices || {}) as [
      keyof typeof tintWindowBasePrices,
      number
    ][]
  ).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      next.tintWindowBasePrices[key] = Math.round(value);
    }
  });

  (
    Object.entries(overrides.tintPpfBasePrices || {}) as [
      keyof typeof tintPpfBasePrices,
      number
    ][]
  ).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      next.tintPpfBasePrices[key] = Math.round(value);
    }
  });

  (
    Object.entries(overrides.tintPriceGuideAmounts || {}) as [
      keyof typeof tintPriceGuideAmounts,
      number
    ][]
  ).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      next.tintPriceGuideAmounts[key] = Math.round(value);
    }
  });

  (
    Object.entries(overrides.tintLevelMultipliers || {}) as unknown as [
      keyof typeof tintLevelMultipliers,
      number
    ][]
  ).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      next.tintLevelMultipliers[key] = value;
    }
  });

  (
    Object.entries(overrides.tintVehicleSizeMultipliers || {}) as [
      keyof typeof tintVehicleSizeMultipliers,
      number
    ][]
  ).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      next.tintVehicleSizeMultipliers[key] = value;
    }
  });

  return next;
}

export function applyPricingOverrides(overrides?: PricingOverrides | null) {
  livePricing = mergePricingOverrides(overrides);
  return livePricing;
}

export function resetPricingToDefaults() {
  livePricing = cloneDefaults();
  return livePricing;
}

export function getDefaultPricingSnapshot(): LivePricing {
  return cloneDefaults();
}
