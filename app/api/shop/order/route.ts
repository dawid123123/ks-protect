import { NextResponse } from 'next/server';
import { isMailConfigured, sendMail } from '../../../../lib/mail';
import { shopOrderEmail } from '../../../../lib/mailTemplates';
import { verifyTurnstileToken } from '../../../../lib/turnstile';
import {
  buildOrderMailBody,
  CartState,
  ShopDelivery,
  ShopPayment,
} from '../../../../components/shopCartUtils';
import { ShopProduct } from '../../../../components/shopData';
import { Language } from '../../../../lib/i18n/types';

export const dynamic = 'force-dynamic';

type OrderBody = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  delivery?: ShopDelivery;
  payment?: ShopPayment;
  coupon?: string | null;
  lang?: Language;
  cart?: CartState;
  products?: ShopProduct[];
  turnstileToken?: string;
};

function clean(value: unknown, max = 500) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export async function POST(request: Request) {
  let body: OrderBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 120);
  const address = clean(body.address, 240);
  const notes = clean(body.notes, 2000);
  const cart = body.cart && typeof body.cart === 'object' ? body.cart : {};
  const products = Array.isArray(body.products) ? body.products : [];
  const delivery: ShopDelivery =
    body.delivery === 'delivery' ? 'delivery' : 'pickup';
  const payment: ShopPayment =
    body.payment === 'card_valitor' ? 'card_valitor' : 'pay_on_site';
  const lang: Language = body.lang === 'en' ? 'en' : 'is';
  const token = String(body.turnstileToken || '');

  if (!name || !phone || !email) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  const itemCount = Object.values(cart).reduce(
    (sum, qty) => sum + (Number(qty) || 0),
    0
  );
  if (itemCount <= 0 || products.length === 0) {
    return NextResponse.json({ ok: false, error: 'empty_cart' }, { status: 400 });
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

  const text = buildOrderMailBody(
    cart,
    {
      name,
      phone,
      email,
      address,
      delivery,
      payment,
      notes,
    },
    body.coupon || null,
    lang,
    products
  );

  const mail = shopOrderEmail({ name, textBody: text });

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
