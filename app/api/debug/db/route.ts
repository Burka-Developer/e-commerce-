import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  // Disable in production to avoid leaking DB metadata
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }
  try {
    const ping = await query<any>("SELECT 1 AS ok")
    const dbnameRows = await query<Array<{ db: string }>>("SELECT DATABASE() AS db")
    return NextResponse.json({
      ok: true,
      ping,
      database: dbnameRows?.[0]?.db ?? null,
      node: process.version,
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || String(e),
      },
      { status: 500 },
    )
  }
}
