import { promises as fs } from 'fs';
import path from 'path';
import { list, put, del } from '@vercel/blob';
import {
  ShopCategoryDef,
  ShopProduct,
  mergeCatalogCategories,
  shopProducts,
  cloneDefaultCategories,
} from '../components/shopData';

const CATALOG_PATHNAME = 'ks-protect/shop-catalog.json';
const LOCAL_CATALOG_PATH = path.join(
  process.cwd(),
  'public',
  'shop-catalog.json'
);

export type ShopCatalogPayload = {
  updatedAt: string;
  products: ShopProduct[];
  categories: ShopCategoryDef[];
};

function normalizeProducts(products: ShopProduct[]): ShopProduct[] {
  return products.map((product) => ({
    ...product,
    active: product.active !== false,
  }));
}

function normalizeCatalog(
  products: ShopProduct[],
  categories?: ShopCategoryDef[]
): ShopCatalogPayload {
  const normalizedProducts = normalizeProducts(products);
  return {
    updatedAt: new Date().toISOString(),
    products: normalizedProducts,
    categories: mergeCatalogCategories(categories, normalizedProducts),
  };
}

function defaultCatalog(): ShopCatalogPayload {
  return normalizeCatalog(shopProducts, cloneDefaultCategories());
}

/** Reject old demo placeholders / empty catalogs so defaults stay visible. */
export function isUsableShopCatalog(products: ShopProduct[]) {
  const active = products.filter((product) => product.active !== false);
  if (active.length === 0) {
    return false;
  }

  const withImage = active.filter((product) => Boolean(product.image)).length;
  const knownIds = new Set(shopProducts.map((product) => product.id));
  const knownMatch = active.filter((product) => knownIds.has(product.id)).length;

  // Pure English placeholders with no images and no real product ids.
  if (withImage === 0 && knownMatch === 0) {
    return false;
  }

  return true;
}

async function readLocalCatalog(): Promise<ShopCatalogPayload | null> {
  try {
    const raw = await fs.readFile(LOCAL_CATALOG_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ShopCatalogPayload>;
    if (!Array.isArray(parsed.products)) {
      return null;
    }
    return {
      ...normalizeCatalog(parsed.products, parsed.categories),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function writeLocalCatalog(payload: ShopCatalogPayload) {
  await fs.mkdir(path.dirname(LOCAL_CATALOG_PATH), { recursive: true });
  await fs.writeFile(LOCAL_CATALOG_PATH, JSON.stringify(payload, null, 2), 'utf8');
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readBlobCatalog(): Promise<ShopCatalogPayload | null> {
  const { blobs } = await list({
    prefix: 'ks-protect/shop-catalog',
    limit: 10,
  });

  const match =
    blobs.find((blob) => blob.pathname === CATALOG_PATHNAME) || blobs[0];

  if (!match) {
    return null;
  }

  const response = await fetch(match.url, { cache: 'no-store' });
  if (!response.ok) {
    return null;
  }

  const parsed = (await response.json()) as Partial<ShopCatalogPayload>;
  if (!Array.isArray(parsed.products)) {
    return null;
  }

  return {
    ...normalizeCatalog(parsed.products, parsed.categories),
    updatedAt: parsed.updatedAt || new Date().toISOString(),
  };
}

async function writeBlobCatalog(payload: ShopCatalogPayload) {
  const { blobs } = await list({
    prefix: 'ks-protect/shop-catalog',
    limit: 20,
  });

  if (blobs.length > 0) {
    await del(blobs.map((blob) => blob.url));
  }

  await put(CATALOG_PATHNAME, JSON.stringify(payload), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

export async function getShopCatalog(): Promise<ShopCatalogPayload> {
  if (hasBlobToken()) {
    const fromBlob = await readBlobCatalog();
    if (fromBlob && isUsableShopCatalog(fromBlob.products)) {
      return fromBlob;
    }

    // Heal stale Blob placeholders so production stops flashing empty cards.
    if (fromBlob && !isUsableShopCatalog(fromBlob.products)) {
      const healed = defaultCatalog();
      try {
        await writeBlobCatalog(healed);
      } catch {
        // Still return defaults even if rewrite fails.
      }
      return healed;
    }
  }

  const fromLocal = await readLocalCatalog();
  if (fromLocal && isUsableShopCatalog(fromLocal.products)) {
    return fromLocal;
  }

  return defaultCatalog();
}

export async function saveShopCatalog(
  products: ShopProduct[],
  categories?: ShopCategoryDef[]
) {
  const payload = normalizeCatalog(products, categories);

  if (hasBlobToken()) {
    await writeBlobCatalog(payload);
    return {
      ...payload,
      storage: 'blob' as const,
    };
  }

  await writeLocalCatalog(payload);
  return {
    ...payload,
    storage: 'local' as const,
  };
}

export async function uploadShopImage(file: File) {
  if (!hasBlobToken()) {
    throw new Error('BLOB_NOT_CONFIGURED');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-') || 'image.jpg';
  const pathname =
    'ks-protect/products/' + Date.now().toString(36) + '-' + safeName;

  const uploaded = await put(pathname, file, {
    access: 'public',
    contentType: file.type || 'image/jpeg',
  });

  return uploaded.url;
}

export function isBlobConfigured() {
  return hasBlobToken();
}
