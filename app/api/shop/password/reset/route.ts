import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import {
  setShopPassword,
  verifyShopRecoveryPin,
} from '../../../../../lib/shopAuth';
import {
  hashOtpCode,
  readShopAuthRecord,
  writeShopAuthRecord,
} from '../../../../../lib/shopAuthStore';

export const dynamic = 'force-dynamic';

function safeEqual(a: string, b: string) {
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

export async function POST(request: Request) {
  let body: { pin?: string; code?: string; newPassword?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!verifyShopRecoveryPin(String(body.pin || ''))) {
    return NextResponse.json({ ok: false, error: 'wrong_pin' }, { status: 401 });
  }

  const code = String(body.code || '').trim();
  const newPassword = String(body.newPassword || '');

  if (newPassword.length < 8) {
    return NextResponse.json({ ok: false, error: 'weak_password' }, { status: 400 });
  }

  const record = await readShopAuthRecord();
  if (!record.otp?.hash || !record.otp.expiresAt) {
    return NextResponse.json({ ok: false, error: 'otp_missing' }, { status: 400 });
  }
  if (record.otp.purpose && record.otp.purpose !== 'reset') {
    return NextResponse.json({ ok: false, error: 'otp_invalid' }, { status: 400 });
  }
  if (Date.now() > record.otp.expiresAt) {
    await writeShopAuthRecord({ ...record, otp: null });
    return NextResponse.json({ ok: false, error: 'otp_expired' }, { status: 400 });
  }
  if (!safeEqual(hashOtpCode(code), record.otp.hash)) {
    return NextResponse.json({ ok: false, error: 'otp_invalid' }, { status: 400 });
  }

  await setShopPassword(newPassword);

  const response = NextResponse.json({ ok: true });
  response.cookies.set('ks_shop_admin', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
