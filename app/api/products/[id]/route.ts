import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = Number(params.id)
  const updates = await req.json()

  if (process.env.DEMO_AUTH_ENABLED === "true") {
    // In demo mode we don't persist to DB
    return NextResponse.json({ ok: true })
  }

  const fields: string[] = []
  const values: any[] = []

  const map: Record<string, string> = {
    name: "name",
    description: "description",
    price: "price",
    originalPrice: "original_price",
    categoryId: "category_id",
    brand: "brand",
    inStock: "in_stock",
    stockQuantity: "stock_quantity",
    badge: "badge",
  }

  for (const [k, v] of Object.entries(updates)) {
    if (k === "images" || k === "features" || k === "specifications") {
      fields.push(`${k} = ?`)
      values.push(JSON.stringify(v))
    } else if (map[k]) {
      fields.push(`${map[k]} = ?`)
      values.push(k === "inStock" ? (v ? 1 : 0) : v)
    }
  }

  if (!fields.length) return NextResponse.json({ ok: true })

  await query(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, [...values, id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = Number(params.id)
  if (process.env.DEMO_AUTH_ENABLED === "true") {
    return NextResponse.json({ ok: true })
  }
  await query("DELETE FROM products WHERE id = ?", [id])
  return NextResponse.json({ ok: true })
}
