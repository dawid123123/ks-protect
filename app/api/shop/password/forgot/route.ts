import { NextResponse } from 'next/server';
import { adminNotifyEmail } from '../../../../../lib/shopAuth';
import {
  generateOtpCode,
  hashOtpCode,
  readShopAuthRecord,
  writeShopAuthRecord,
} from '../../../../../lib/shopAuthStore';
import { isMailConfigured, sendMail } from '../../../../../lib/mail';
import { passwordCodeEmail } from '../../../../../lib/mailTemplates';

export const dynamic = 'force-dynamic';

const COOLDOWN_MS = 60_000;

export async function POST() {
  if (!isMailConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'mail_not_configured' },
      { status: 503 }
    );
  }

  const record = await readShopAuthRecord();
  const lastRequest = record.otp?.requestedAt || 0;
  if (Date.now() - lastRequest < COOLDOWN_MS) {
    return NextResponse.json({ ok: false, error: 'too_soon' }, { status: 429 });
  }

  const code = generateOtpCode();
  const to = adminNotifyEmail();

  await writeShopAuthRecord({
    ...record,
    otp: {
      hash: hashOtpCode(code),
      expiresAt: Date.now() + 15 * 60 * 1000,
      requestedAt: Date.now(),
      purpose: 'reset',
    },
  });

  const mail = passwordCodeEmail(code);
  try {
    await sendMail({
      to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    sentToHint: to.replace(/(.{2}).+(@.+)/, '$1***$2'),
  });
}
