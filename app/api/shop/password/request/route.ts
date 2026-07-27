import { NextResponse } from 'next/server';
import {
  adminNotifyEmail,
  isShopAdminAuthenticated,
  verifyShopPassword,
} from '../../../../../lib/shopAuth';
import {
  generateOtpCode,
  hashOtpCode,
  readShopAuthRecord,
  writeShopAuthRecord,
} from '../../../../../lib/shopAuthStore';
import { isMailConfigured, sendMail } from '../../../../../lib/mail';
import { passwordCodeEmail } from '../../../../../lib/mailTemplates';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await isShopAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: { currentPassword?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const currentPassword = String(body.currentPassword || '');
  if (!(await verifyShopPassword(currentPassword))) {
    return NextResponse.json({ ok: false, error: 'wrong_password' }, { status: 401 });
  }

  if (!isMailConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'mail_not_configured' },
      { status: 503 }
    );
  }

  const code = generateOtpCode();
  const record = await readShopAuthRecord();
  await writeShopAuthRecord({
    ...record,
    otp: {
      hash: hashOtpCode(code),
      expiresAt: Date.now() + 15 * 60 * 1000,
    },
  });

  const to = adminNotifyEmail();
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
