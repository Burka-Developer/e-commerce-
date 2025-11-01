import { NextResponse } from "next/server"
import { getAuthFromCookies } from "@/lib/auth"
import { query } from "@/lib/db"

type RecentOrder = {
  id: number
  orderId: string
  customerName: string
  customerEmail: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
}

export async function GET() {
  const auth = await getAuthFromCookies()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const rows = await query<Array<{
      id: number
      user_id: number
      user_name: string | null
      user_email: string | null
      total: number | string
      status: string
      payment_status: string
      created_at: Date | string
    }>>(`
      SELECT o.id,
             o.user_id,
             u.name AS user_name,
             u.email AS user_email,
             o.total,
             o.status,
             o.payment_status,
             o.created_at
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT 5
    `)

    const data: RecentOrder[] = (rows || []).map((r) => ({
      id: r.id,
      orderId: `#${r.id}`,
      customerName: r.user_name || "Customer",
      customerEmail: r.user_email || "",
      total: Number(r.total || 0),
      status: r.status,
      paymentStatus: r.payment_status,
      createdAt: typeof r.created_at === "string" ? r.created_at : new Date(r.created_at).toISOString(),
    }))

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch" }, { status: 500 })
  }
}
