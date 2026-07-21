import { NextResponse } from 'next/server';
import {
  expectedShopPassword,
  makeShopAdminToken,
} from '../../../../lib/shopAuth';
import { timingSafeEqual } from 'crypto';

export async function POST(request: Request) {
  let body: { password?: string } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const password = String(body.password || '');
  const expected = expectedShopPassword();

  const a = Buffer.from(password);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = makeShopAdminToken(expected);
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
