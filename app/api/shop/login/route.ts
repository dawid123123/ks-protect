import { NextResponse } from 'next/server';
import {
  getShopAuthSecret,
  makeShopAdminToken,
  verifyShopPassword,
} from '../../../../lib/shopAuth';

export async function POST(request: Request) {
  let body: { password?: string } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const password = String(body.password || '');
  if (!(await verifyShopPassword(password))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = makeShopAdminToken(await getShopAuthSecret());
  const response = NextResponse.json({ ok: true });
  response.cookies.set('ks_shop_admin', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return response;
}
