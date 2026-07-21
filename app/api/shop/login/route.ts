import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

function expectedPassword() {
  return process.env.SHOP_ADMIN_PASSWORD || 'ksprotect2026';
}

function makeToken(password: string) {
  return createHmac('sha256', password).update('ks-shop-admin-v1').digest('hex');
}

export async function POST(request: Request) {
  let body: { password?: string } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const password = String(body.password || '');
  const expected = expectedPassword();

  const a = Buffer.from(password);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = makeToken(expected);
  const response = NextResponse.json({ ok: true });
  response.cookies.set('ks_shop_admin', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
