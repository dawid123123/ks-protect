import { ShopProduct, shopProducts } from '../components/shopData';

export const SHOP_STORAGE_KEY = 'ks-shop-products-v1';

export function cloneDefaultProducts(): ShopProduct[] {
  return shopProducts.map((product) => ({
    ...product,
    active: product.active !== false,
  }));
}

export function loadStoredProducts(): ShopProduct[] | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SHOP_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { products?: ShopProduct[] };
    if (!Array.isArray(parsed.products) || parsed.products.length === 0) {
      return null;
    }

    return parsed.products.map((product) => ({
      ...product,
      active: product.active !== false,
    }));
  } catch {
    return null;
  }
}

export function saveStoredProducts(products: ShopProduct[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    SHOP_STORAGE_KEY,
    JSON.stringify({
      updatedAt: new Date().toISOString(),
      products,
    })
  );
}

export function clearStoredProducts() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SHOP_STORAGE_KEY);
}

export async function loadPublicCatalog(): Promise<ShopProduct[] | null> {
  try {
    const response = await fetch('/shop-catalog.json', { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { products?: ShopProduct[] };
    if (!Array.isArray(data.products) || data.products.length === 0) {
      return null;
    }

    return data.products.map((product) => ({
      ...product,
      active: product.active !== false,
    }));
  } catch {
    return null;
  }
}

export function createProductId(name: string) {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return (base || 'product') + '-' + Date.now().toString(36);
}

export function resizeImageFile(
  file: File,
  maxWidth = 900,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
