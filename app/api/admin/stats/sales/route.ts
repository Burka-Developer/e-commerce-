import { NextResponse } from "next/server"
import { getPool, query } from "@/lib/db"
import { getAuthFromCookies } from "@/lib/auth"

export async function GET() {
  const auth = await getAuthFromCookies()
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Demo mode: return mock sales series without hitting the database
  if (process.env.DEMO_AUTH_ENABLED === "true") {
    const today = new Date()
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      const day = d.toISOString().slice(0, 10)
      const gross = Number((Math.random() * 200 + 50).toFixed(2))
      return { day, orders: Math.floor(gross / 20), gross }
    })
    return NextResponse.json(days)
  }

  await getPool()
  const rows = await query<Array<{ day: string; orders: number; gross: number }>>(
    `SELECT DATE(created_at) as day,
            COUNT(*) as orders,
            COALESCE(SUM(total), 0) as gross
     FROM orders
     GROUP BY DATE(created_at)
     ORDER BY DATE(created_at) ASC`,
  )
  return NextResponse.json(rows)
}
