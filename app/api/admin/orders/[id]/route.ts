import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthFromCookies } from "@/lib/auth"
import { query } from "@/lib/db"

const PatchSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  tracking: z.string().max(120).optional(),
  notes: z.string().max(4000).optional(),
})

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthFromCookies()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = Number(params.id)
  if (!id || Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  let body: z.infer<typeof PatchSchema>
  try {
    const json = await _.json()
    body = PatchSchema.parse(json)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invalid payload" }, { status: 400 })
  }

  const fields: string[] = []
  const paramsSql: any[] = []
  if (body.status) {
    fields.push("status = ?")
    paramsSql.push(body.status)
  }
  if (typeof body.tracking !== "undefined") {
    fields.push("tracking = ?")
    paramsSql.push(body.tracking || null)
  }
  if (typeof body.notes !== "undefined") {
    fields.push("notes = ?")
    paramsSql.push(body.notes || null)
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  try {
    await query(
      `UPDATE orders SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...paramsSql, id],
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Update failed" }, { status: 500 })
  }
}
