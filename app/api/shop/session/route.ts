import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isShopAdminAuthenticated } from '../../../../lib/shopAuth';

export async function GET() {
  return NextResponse.json({ ok: isShopAdminAuthenticated() });
}
