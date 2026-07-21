import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

export function expectedShopPassword() {
  return process.env.SHOP_ADMIN_PASSWORD || 'ksprotect2026';
}

export function makeShopAdminToken(password: string) {
  return createHmac('sha256', password).update('ks-shop-admin-v1').digest('hex');
}

export function isShopAdminAuthenticated() {
  const token = cookies().get('ks_shop_admin')?.value || '';
  const expected = makeShopAdminToken(expectedShopPassword());

  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
