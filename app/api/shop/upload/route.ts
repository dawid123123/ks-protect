import { NextResponse } from 'next/server';
import { isShopAdminAuthenticated } from '../../../../lib/shopAuth';
import { isBlobConfigured, uploadShopImage } from '../../../../lib/shopServerStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isShopAdminAuthenticated()) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  if (!isBlobConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'blob_not_configured' },
      { status: 503 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'missing_file' }, { status: 400 });
    }

    const url = await uploadShopImage(file);
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'upload_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
