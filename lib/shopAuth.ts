import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import {
  hashPassword,
  readShopAuthRecord,
  verifyPasswordHash,
  writeShopAuthRecord,
} from './shopAuthStore';

export function expectedEnvShopPassword() {
  return process.env.SHOP_ADMIN_PASSWORD || 'ksprotect2026';
}

/** Fixed recovery PIN for forgot-password. Not stored / not changeable. */
export const SHOP_RECOVERY_PIN = '4456';

export function verifyShopRecoveryPin(pin: string) {
  return safeEqualString(String(pin || '').trim(), SHOP_RECOVERY_PIN);
}

export function adminNotifyEmail() {
  return (
    process.env.MAIL_TO ||
    process.env.ADMIN_EMAIL ||
    'ksprotect@ksprotect.is'
  );
}

export function makeShopAdminToken(secret: string) {
  return createHmac('sha256', secret).update('ks-shop-admin-v1').digest('hex');
}

function safeEqualString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  try {
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export async function getShopAuthSecret() {
  const record = await readShopAuthRecord();
  if (record.passwordHash) {
    return 'hash:' + record.passwordHash;
  }
  return 'env:' + expectedEnvShopPassword();
}

export async function verifyShopPassword(password: string) {
  const record = await readShopAuthRecord();
  if (record.passwordHash) {
    return verifyPasswordHash(password, record.passwordHash);
  }
  return safeEqualString(password, expectedEnvShopPassword());
}

export async function isShopAdminAuthenticated() {
  const token = cookies().get('ks_shop_admin')?.value || '';
  const expected = makeShopAdminToken(await getShopAuthSecret());
  return safeEqualString(token, expected);
}

export async function setShopPassword(newPassword: string) {
  const record = await readShopAuthRecord();
  await writeShopAuthRecord({
    ...record,
    passwordHash: hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
    otp: null,
  });
}
