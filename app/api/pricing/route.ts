import { NextResponse } from 'next/server';
import { isShopAdminAuthenticated } from '../../../lib/shopAuth';
import { PricingOverrides } from '../../../lib/pricingRuntime';
import {
  getPricingPayload,
  isBlobConfigured,
  savePricingOverrides,
} from '../../../lib/pricingServerStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = await getPricingPayload();
  return NextResponse.json({
    ...payload,
    blobConfigured: isBlobConfigured(),
  });
}

export async function PUT(request: Request) {
  if (!isShopAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: { overrides?: PricingOverrides } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!body.overrides || typeof body.overrides !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid_overrides' }, { status: 400 });
  }

  try {
    const saved = await savePricingOverrides(body.overrides);
    return NextResponse.json({
      ok: true,
      ...saved,
      blobConfigured: isBlobConfigured(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'save_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
