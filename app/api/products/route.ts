import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { demoProducts } from "@/lib/demo-data"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    if (process.env.DEMO_AUTH_ENABLED === "true") {
      if (process.env.NODE_ENV !== "production" || process.env.API_LOG_PRODUCTS === "true") {
        console.log(`[api/products] demo mode: count=${demoProducts.length}, ids=${demoProducts.map(p => p.id).slice(0,10).join(",")}`)
      }
      // Normalize demo data to match DB shape (parse JSON fields)
      const products = demoProducts.map((p: any) => {
        let images: any = []
        let features: any = []
        let specifications: any = {}
        try { images = Array.isArray(p.images) ? p.images : JSON.parse(p.images || "[]") } catch {}
        try { features = Array.isArray(p.features) ? p.features : JSON.parse(p.features || "[]") } catch {}
        try {
          specifications = typeof p.specifications === "object" && p.specifications !== null ? p.specifications : JSON.parse(p.specifications || "{}")
        } catch {}
        return { ...p, images, features, specifications }
      })
      return NextResponse.json({ products })
    }
    const rows = await query<any[]>(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.updated_at DESC`,
    )
    const products = (rows || []).map((p) => {
      let images: any = []
      let features: any = []
      let specifications: any = {}
      try { images = Array.isArray(p.images) ? p.images : JSON.parse(p.images || "[]") } catch {}
      try { features = Array.isArray(p.features) ? p.features : JSON.parse(p.features || "[]") } catch {}
      try { specifications = typeof p.specifications === "object" && p.specifications !== null ? p.specifications : JSON.parse(p.specifications || "{}") } catch {}
      return {
        ...p,
        images,
        features,
        specifications,
      }
    })
    if (process.env.NODE_ENV !== "production" || process.env.API_LOG_PRODUCTS === "true") {
      console.log(`[api/products] db mode: count=${products?.length ?? 0}, ids=${(products||[]).map((p:any) => p.id).slice(0,10).join(",")}`)
    }
    return NextResponse.json({ products })
  } catch (e: any) {
    // Graceful fallback when DB is not configured yet
    if (process.env.NODE_ENV !== "production" || process.env.API_LOG_PRODUCTS === "true") {
      console.error(`[api/products] error:`, e?.message || e)
    }
    return NextResponse.json({ products: [] })
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const {
    name,
    description,
    price,
    originalPrice,
    categoryId,
    brand,
    images = [],
    inStock = true,
    stockQuantity = 0,
    badge,
    features = [],
    specifications = {},
  } = body

  if (process.env.DEMO_AUTH_ENABLED === "true") {
    // In demo mode we don't persist, just acknowledge
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  await query(
    `INSERT INTO products
      (name, description, price, original_price, category_id, brand, images, in_stock, stock_quantity, badge, features, specifications)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description,
      price,
      originalPrice ?? null,
      categoryId ?? null,
      brand ?? null,
      JSON.stringify(images),
      inStock ? 1 : 0,
      stockQuantity,
      badge ?? null,
      JSON.stringify(features),
      JSON.stringify(specifications),
    ],
  )

  return NextResponse.json({ ok: true }, { status: 201 })
}
