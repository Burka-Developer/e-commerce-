import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const rows = await query<{ ok: number }>("SELECT 1 AS ok")
    const ok = Array.isArray(rows) && rows.length ? (rows[0] as any).ok : 0
    return NextResponse.json({ ok: true, db: ok === 1 })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 500 })
  }
}
