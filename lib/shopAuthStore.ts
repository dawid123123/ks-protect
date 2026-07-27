import { createHash, randomInt, scryptSync, timingSafeEqual } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { list, put, del } from '@vercel/blob';

const AUTH_PATHNAME = 'ks-protect/shop-admin-auth.json';
const LOCAL_AUTH_PATH = path.join(process.cwd(), 'data', 'shop-admin-auth.json');

export type ShopAuthRecord = {
  passwordHash?: string;
  updatedAt?: string;
  otp?: {
    hash: string;
    expiresAt: number;
    requestedAt?: number;
    purpose?: 'change' | 'reset';
  } | null;
};

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readLocalAuth(): Promise<ShopAuthRecord | null> {
  try {
    const raw = await fs.readFile(LOCAL_AUTH_PATH, 'utf8');
    return JSON.parse(raw) as ShopAuthRecord;
  } catch {
    return null;
  }
}

async function writeLocalAuth(record: ShopAuthRecord) {
  await fs.mkdir(path.dirname(LOCAL_AUTH_PATH), { recursive: true });
  await fs.writeFile(LOCAL_AUTH_PATH, JSON.stringify(record, null, 2), 'utf8');
}

async function readBlobAuth(): Promise<ShopAuthRecord | null> {
  const { blobs } = await list({
    prefix: 'ks-protect/shop-admin-auth',
    limit: 10,
  });
  const match =
    blobs.find((blob) => blob.pathname === AUTH_PATHNAME) || blobs[0];
  if (!match) {
    return null;
  }
  const response = await fetch(match.url, { cache: 'no-store' });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as ShopAuthRecord;
}

async function writeBlobAuth(record: ShopAuthRecord) {
  const { blobs } = await list({
    prefix: 'ks-protect/shop-admin-auth',
    limit: 20,
  });
  if (blobs.length > 0) {
    await del(blobs.map((blob) => blob.url));
  }
  await put(AUTH_PATHNAME, JSON.stringify(record), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

export async function readShopAuthRecord(): Promise<ShopAuthRecord> {
  if (hasBlobToken()) {
    const fromBlob = await readBlobAuth();
    if (fromBlob) {
      return fromBlob;
    }
  }
  return (await readLocalAuth()) || {};
}

export async function writeShopAuthRecord(record: ShopAuthRecord) {
  if (hasBlobToken()) {
    await writeBlobAuth(record);
    return;
  }
  await writeLocalAuth(record);
}

export function hashPassword(password: string) {
  const salt = randomInt(1e9).toString(16) + randomInt(1e9).toString(16);
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPasswordHash(password: string, stored: string) {
  const [algo, salt, hash] = stored.split('$');
  if (algo !== 'scrypt' || !salt || !hash) {
    return false;
  }
  const next = scryptSync(password, salt, 64).toString('hex');
  try {
    return timingSafeEqual(Buffer.from(next), Buffer.from(hash));
  } catch {
    return false;
  }
}

export function hashOtpCode(code: string) {
  return createHash('sha256').update(`ks-otp:${code}`).digest('hex');
}

export function generateOtpCode() {
  return String(randomInt(100000, 999999));
}
