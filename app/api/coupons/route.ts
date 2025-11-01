import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { demoCoupons } from "@/lib/demo-data"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  if (process.env.DEMO_AUTH_ENABLED === "true") {
    return NextResponse.json({ coupons: demoCoupons })
  }
  const coupons = await query<any[]>("SELECT * FROM coupons ORDER BY updated_at DESC")
  return NextResponse.json({ coupons })
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const {
    code,
    description,
    type, // 'percentage' | 'fixed'
    value,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    expiresAt,
    isActive = true,
  } = body

  if (process.env.DEMO_AUTH_ENABLED === "true") {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  await query(
    `INSERT INTO coupons
      (code, description, type, value, min_order_amount, max_discount, usage_limit, expires_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      code,
      description ?? null,
      type,
      value,
      minOrderAmount ?? null,
      maxDiscount ?? null,
      usageLimit ?? null,
      expiresAt ?? null,
      isActive ? 1 : 0,
    ],
  )

  return NextResponse.json({ ok: true }, { status: 201 })
}
