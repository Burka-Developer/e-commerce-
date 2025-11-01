import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    const body = await req.json().catch(() => ({}))
    const fields: string[] = []
    const values: any[] = []

    if (typeof body.name === "string") {
      fields.push("name = ?")
      values.push(String(body.name).trim())
    }
    if (typeof body.description !== "undefined") {
      fields.push("description = ?")
      values.push(body.description ? String(body.description).trim() : null)
    }
    if (typeof body.image !== "undefined") {
      fields.push("image = ?")
      values.push(body.image ? String(body.image).trim() : null)
    }
    if (typeof body.isActive !== "undefined") {
      fields.push("is_active = ?")
      values.push(body.isActive ? 1 : 0)
    }

    if (fields.length === 0) return NextResponse.json({ error: "No changes" }, { status: 400 })

    values.push(id)
    await query(`UPDATE categories SET ${fields.join(", ")} WHERE id = ?`, values)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    // Ensure no products are linked, else block or set null
    const hasProducts = await query<any[]>("SELECT id FROM products WHERE category_id = ? LIMIT 1", [id])
    if (hasProducts.length) {
      return NextResponse.json({ error: "Category has products. Reassign or remove products first." }, { status: 400 })
    }
    await query("DELETE FROM categories WHERE id = ?", [id])
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
