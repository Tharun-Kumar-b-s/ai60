import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getSql();
    const ext = await sql`select extname from pg_extension where extname in ('pgcrypto','pg_trgm')`;
    const [{ students }] = await sql`select count(*)::int as students from students`;
    return NextResponse.json({ ok: true, extensions: ext.map((e) => e.extname), students });
  } catch {
    return NextResponse.json({ ok: false, error: 'database_unreachable' }, { status: 500 });
  }
}
