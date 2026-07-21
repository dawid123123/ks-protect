import { NextResponse } from 'next/server';
import { ShopProduct } from '../../../../components/shopData';
import { isShopAdminAuthenticated } from '../../../../lib/shopAuth';
import {
  getShopCatalog,
  isBlobConfigured,
  saveShopCatalog,
} from '../../../../lib/shopServerStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const catalog = await getShopCatalog();
  return NextResponse.json({
    ...catalog,
    blobConfigured: isBlobConfigured(),
  });
}

export async function PUT(request: Request) {
  if (!isShopAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: { products?: ShopProduct[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!Array.isArray(body.products)) {
    return NextResponse.json({ ok: false, error: 'invalid_products' }, { status: 400 });
  }

  try {
    const saved = await saveShopCatalog(body.products);
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
