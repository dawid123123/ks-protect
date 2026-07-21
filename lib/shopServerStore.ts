import { promises as fs } from 'fs';
import path from 'path';
import { list, put, del } from '@vercel/blob';
import { ShopProduct, shopProducts } from '../components/shopData';

const CATALOG_PATHNAME = 'ks-protect/shop-catalog.json';
const LOCAL_CATALOG_PATH = path.join(
  process.cwd(),
  'public',
  'shop-catalog.json'
);

export type ShopCatalogPayload = {
  updatedAt: string;
  products: ShopProduct[];
};

function normalizeProducts(products: ShopProduct[]): ShopProduct[] {
  return products.map((product) => ({
    ...product,
    active: product.active !== false,
  }));
}

function defaultCatalog(): ShopCatalogPayload {
  return {
    updatedAt: new Date().toISOString(),
    products: normalizeProducts(shopProducts),
  };
}

async function readLocalCatalog(): Promise<ShopCatalogPayload | null> {
  try {
    const raw = await fs.readFile(LOCAL_CATALOG_PATH, 'utf8');
    const parsed = JSON.parse(raw) as ShopCatalogPayload;
    if (!Array.isArray(parsed.products)) {
      return null;
    }
    return {
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      products: normalizeProducts(parsed.products),
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

  const parsed = (await response.json()) as ShopCatalogPayload;
  if (!Array.isArray(parsed.products)) {
    return null;
  }

  return {
    updatedAt: parsed.updatedAt || new Date().toISOString(),
    products: normalizeProducts(parsed.products),
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
    if (fromBlob) {
      return fromBlob;
    }
  }

  const fromLocal = await readLocalCatalog();
  if (fromLocal) {
    return fromLocal;
  }

  return defaultCatalog();
}

export async function saveShopCatalog(products: ShopProduct[]) {
  const payload: ShopCatalogPayload = {
    updatedAt: new Date().toISOString(),
    products: normalizeProducts(products),
  };

  if (hasBlobToken()) {
    await writeBlobCatalog(payload);
    return {
      ...payload,
      storage: 'blob' as const,
    };
  }

  // Local / preview without Blob: persist to public file.
  await writeLocalCatalog(payload);
  return {
    ...payload,
    storage: 'local' as const,
  };
}

export async function uploadShopImage(file: File) {
  if (!hasBlobToken()) {
    // Local fallback: keep data URL from client (handled there).
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
