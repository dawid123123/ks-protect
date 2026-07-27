import { NextResponse } from 'next/server';
import { isMailConfigured, sendMail } from '../../../lib/mail';
import { contactInquiryEmail } from '../../../lib/mailTemplates';
import { verifyTurnstileToken } from '../../../lib/turnstile';

export const dynamic = 'force-dynamic';

type ContactBody = {
  name?: string;
  phone?: string;
  email?: string;
  vehicle?: string;
  service?: string;
  message?: string;
  turnstileToken?: string;
  lang?: string;
};

function clean(value: unknown, max = 500) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export async function POST(request: Request) {
  let body: ContactBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 120);
  const vehicle = clean(body.vehicle, 120);
  const service = clean(body.service, 120);
  const message = clean(body.message, 4000);
  const token = String(body.turnstileToken || '');

  if (!name || !phone || !email || !vehicle || !service) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const captcha = await verifyTurnstileToken(token, ip);
  if (!captcha.ok) {
    return NextResponse.json({ ok: false, error: 'captcha_failed' }, { status: 400 });
  }

  if (!isMailConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'mail_not_configured' },
      { status: 503 }
    );
  }

  const mail = contactInquiryEmail({
    name,
    phone,
    email,
    vehicle,
    service,
    message,
  });

  try {
    await sendMail({
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      replyTo: email,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
