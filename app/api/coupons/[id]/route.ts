import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = Number(params.id)
  const updates = await req.json()

  if (process.env.DEMO_AUTH_ENABLED === "true") {
    return NextResponse.json({ ok: true })
  }

  const fields: string[] = []
  const values: any[] = []

  const map: Record<string, string> = {
    code: "code",
    description: "description",
    type: "type",
    value: "value",
    minOrderAmount: "min_order_amount",
    maxDiscount: "max_discount",
    usageLimit: "usage_limit",
    expiresAt: "expires_at",
    isActive: "is_active",
  }

  for (const [k, v] of Object.entries(updates)) {
    if (map[k]) {
      fields.push(`${map[k]} = ?`)
      values.push(k === "isActive" ? (v ? 1 : 0) : v)
    }
  }

  if (!fields.length) return NextResponse.json({ ok: true })
  await query(`UPDATE coupons SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = Number(params.id)
  if (process.env.DEMO_AUTH_ENABLED === "true") {
    return NextResponse.json({ ok: true })
  }
  await query("DELETE FROM coupons WHERE id = ?", [id])
  return NextResponse.json({ ok: true })
}
