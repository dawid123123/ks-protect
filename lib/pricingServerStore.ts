import { promises as fs } from 'fs';
import path from 'path';
import { list, put, del } from '@vercel/blob';
import {
  PricingOverrides,
  getDefaultPricingSnapshot,
  mergePricingOverrides,
  LivePricing,
} from './pricingRuntime';

const PRICING_PATHNAME = 'ks-protect/pricing.json';
const LOCAL_PRICING_PATH = path.join(
  process.cwd(),
  'public',
  'pricing-overrides.json'
);

export type PricingPayload = {
  updatedAt: string;
  overrides: PricingOverrides;
  pricing: LivePricing;
};

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function sanitizeOverrides(input: PricingOverrides | null | undefined): PricingOverrides {
  const merged = mergePricingOverrides(input || {});
  const defaults = getDefaultPricingSnapshot();
  const overrides: PricingOverrides = {};

  function pickChanged<T extends Record<string, number>>(
    next: T,
    base: T
  ): Partial<T> | undefined {
    const diff: Partial<T> = {};
    let changed = false;
    (Object.keys(next) as (keyof T)[]).forEach((key) => {
      if (next[key] !== base[key]) {
        diff[key] = next[key];
        changed = true;
      }
    });
    return changed ? diff : undefined;
  }

  overrides.ppfPartPrices = pickChanged(merged.ppfPartPrices, defaults.ppfPartPrices);
  overrides.tintWindowBasePrices = pickChanged(
    merged.tintWindowBasePrices,
    defaults.tintWindowBasePrices
  );
  overrides.tintPpfBasePrices = pickChanged(
    merged.tintPpfBasePrices,
    defaults.tintPpfBasePrices
  );
  overrides.tintPriceGuideAmounts = pickChanged(
    merged.tintPriceGuideAmounts,
    defaults.tintPriceGuideAmounts
  );
  // Multipliers are not editable in boss menu � keep any existing ones from input.
  if (input?.tintLevelMultipliers) {
    overrides.tintLevelMultipliers = input.tintLevelMultipliers;
  }
  if (input?.tintVehicleSizeMultipliers) {
    overrides.tintVehicleSizeMultipliers = input.tintVehicleSizeMultipliers;
  }

  return overrides;
}

function toPayload(overrides: PricingOverrides): PricingPayload {
  return {
    updatedAt: new Date().toISOString(),
    overrides: sanitizeOverrides(overrides),
    pricing: mergePricingOverrides(overrides),
  };
}

async function readLocalPricing(): Promise<PricingPayload | null> {
  try {
    const raw = await fs.readFile(LOCAL_PRICING_PATH, 'utf8');
    const parsed = JSON.parse(raw) as { updatedAt?: string; overrides?: PricingOverrides };
    if (!parsed.overrides || typeof parsed.overrides !== 'object') {
      return null;
    }
    return {
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      overrides: sanitizeOverrides(parsed.overrides),
      pricing: mergePricingOverrides(parsed.overrides),
    };
  } catch {
    return null;
  }
}

async function writeLocalPricing(payload: PricingPayload) {
  await fs.mkdir(path.dirname(LOCAL_PRICING_PATH), { recursive: true });
  await fs.writeFile(
    LOCAL_PRICING_PATH,
    JSON.stringify(
      {
        updatedAt: payload.updatedAt,
        overrides: payload.overrides,
      },
      null,
      2
    ),
    'utf8'
  );
}

async function readBlobPricing(): Promise<PricingPayload | null> {
  const { blobs } = await list({
    prefix: 'ks-protect/pricing',
    limit: 10,
  });

  const match =
    blobs.find((blob) => blob.pathname === PRICING_PATHNAME) || blobs[0];

  if (!match) {
    return null;
  }

  const response = await fetch(match.url, { cache: 'no-store' });
  if (!response.ok) {
    return null;
  }

  const parsed = (await response.json()) as {
    updatedAt?: string;
    overrides?: PricingOverrides;
  };

  if (!parsed.overrides || typeof parsed.overrides !== 'object') {
    return null;
  }

  return {
    updatedAt: parsed.updatedAt || new Date().toISOString(),
    overrides: sanitizeOverrides(parsed.overrides),
    pricing: mergePricingOverrides(parsed.overrides),
  };
}

async function writeBlobPricing(payload: PricingPayload) {
  const { blobs } = await list({
    prefix: 'ks-protect/pricing',
    limit: 20,
  });

  if (blobs.length > 0) {
    await del(blobs.map((blob) => blob.url));
  }

  await put(
    PRICING_PATHNAME,
    JSON.stringify({
      updatedAt: payload.updatedAt,
      overrides: payload.overrides,
    }),
    {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    }
  );
}

export async function getPricingPayload(): Promise<PricingPayload> {
  if (hasBlobToken()) {
    const fromBlob = await readBlobPricing();
    if (fromBlob) {
      return fromBlob;
    }
  }

  const fromLocal = await readLocalPricing();
  if (fromLocal) {
    return fromLocal;
  }

  return toPayload({});
}

export async function savePricingOverrides(overrides: PricingOverrides) {
  const payload = toPayload(overrides);

  if (hasBlobToken()) {
    await writeBlobPricing(payload);
    return {
      ...payload,
      storage: 'blob' as const,
    };
  }

  await writeLocalPricing(payload);
  return {
    ...payload,
    storage: 'local' as const,
  };
}

export function isBlobConfigured() {
  return hasBlobToken();
}
