import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { demoCategories } from "@/lib/demo-data"
import { requireAdmin } from "@/lib/auth"

const REQUIRED = [
  { name: "Accessories" },
  { name: "Gym Wear" },
  { name: "Hoodies" },
  { name: "Wedding Clothes" },
  { name: "Abayas" },
]

export async function GET() {
  if (process.env.DEMO_AUTH_ENABLED === "true") {
    return NextResponse.json({ categories: demoCategories })
  }
  try {
    // Ensure required categories exist in DB (idempotent best-effort)
    const existing = await query<any[]>("SELECT id, name FROM categories")
    const existingNames = new Set((existing || []).map((c: any) => String(c.name).toLowerCase()))
    const missing = REQUIRED.filter((c) => !existingNames.has(c.name.toLowerCase()))
    if (missing.length) {
      for (const m of missing) {
        try {
          await query("INSERT INTO categories (name, is_active) VALUES (?, 1)", [m.name])
        } catch {
          // ignore insert errors (e.g., no table or constraints); we'll fallback below if needed
        }
      }
    }

    const rows = await query<any[]>(
      "SELECT id, name, description, image, is_active FROM categories WHERE is_active = 1 ORDER BY name ASC",
    )
    const categories = Array.isArray(rows) ? rows : []
    if (!categories.length) {
      // Fallback to demo categories if DB is empty or table missing, so admin UI has a working selector
      return NextResponse.json({ categories: demoCategories })
    }
    return NextResponse.json({ categories })
  } catch (e: any) {
    // On DB error, also fallback to demo to keep UI functional
    return NextResponse.json({ categories: demoCategories })
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || "").trim()
    const description = typeof body?.description === "string" ? String(body.description).trim() : null
    const image = typeof body?.image === "string" ? String(body.image).trim() : null
    const isActive = body?.isActive === false ? 0 : 1
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 })

    await query("INSERT INTO categories (name, description, image, is_active) VALUES (?, ?, ?, ?)", [
      name,
      description,
      image,
      isActive,
    ])
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
