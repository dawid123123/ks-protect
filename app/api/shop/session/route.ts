import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

function expectedPassword() {
  return process.env.SHOP_ADMIN_PASSWORD || 'ksprotect2026';
}

function makeToken(password: string) {
  return createHmac('sha256', password).update('ks-shop-admin-v1').digest('hex');
}

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('ks_shop_admin')?.value || '';
  const expected = makeToken(expectedPassword());

  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    const ok = a.length === b.length && timingSafeEqual(a, b);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
