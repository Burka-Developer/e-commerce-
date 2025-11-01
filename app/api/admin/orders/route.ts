import { NextResponse } from "next/server"
import { getAuthFromCookies } from "@/lib/auth"
import { query } from "@/lib/db"

// GET /api/admin/orders
// Query params: page, pageSize, q, status, paymentStatus
export async function GET(req: Request) {
  const auth = await getAuthFromCookies()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 25)))
  const q = (searchParams.get("q") || "").trim()
  const status = (searchParams.get("status") || "").trim()
  const paymentStatus = (searchParams.get("paymentStatus") || "").trim()

  const where: string[] = []
  const params: any[] = []

  if (q) {
    // Search by order id, user name, or email
    if (/^#?\d+$/.test(q)) {
      const idNum = Number(q.replace('#', ''))
      where.push("o.id = ?")
      params.push(idNum)
    } else {
      where.push("(u.name LIKE ? OR u.email LIKE ?)")
      params.push(`%${q}%`, `%${q}%`)
    }
  }
  if (status && status !== "all") {
    where.push("o.status = ?")
    params.push(status)
  }
  if (paymentStatus && paymentStatus !== "all") {
    where.push("o.payment_status = ?")
    params.push(paymentStatus)
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""
  const offset = (page - 1) * pageSize

  try {
    // Count total for pagination
    const countRows = await query<Array<{ cnt: number }>>(
      `SELECT COUNT(*) as cnt
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ${whereSql}`,
      params,
    )
    const total = countRows?.[0]?.cnt || 0

    // Fetch paginated orders
    const orders = await query<
      Array<{
        id: number
        user_id: number
        user_name: string | null
        user_email: string | null
        status: string
        total: number | string
        shipping: any
        payment_method: string
        payment_status: string
        tracking: string | null
        notes: string | null
        created_at: Date | string
        updated_at: Date | string
      }>
    >(
      `SELECT o.id, o.user_id, u.name AS user_name, u.email AS user_email, o.status, o.total, o.shipping,
              o.payment_method, o.payment_status, o.tracking, o.notes, o.created_at, o.updated_at
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ${whereSql}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    )

    const orderIds = orders.map((o) => o.id)
    let itemsByOrder = new Map<number, Array<{ name: string; price: number; quantity: number; image: string | null }>>()

    if (orderIds.length) {
      const items = await query<
        Array<{ order_id: number; name: string; price: number | string; quantity: number; image: string | null }>
      >(
        `SELECT order_id, name, price, quantity, image
         FROM order_items
         WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds,
      )
      itemsByOrder = items.reduce((map, it) => {
        const arr = map.get(it.order_id) || []
        arr.push({ name: it.name, price: Number(it.price), quantity: it.quantity, image: it.image })
        map.set(it.order_id, arr)
        return map
      }, new Map<number, Array<{ name: string; price: number; quantity: number; image: string | null }>>())
    }

    const data = orders.map((o) => {
      let shippingAddress: any
      try {
        shippingAddress = typeof o.shipping === 'string' ? JSON.parse(o.shipping) : o.shipping
      } catch {
        shippingAddress = null
      }
      return {
        idNum: o.id,
        id: `#${o.id}`,
        customerId: o.user_id,
        customerName: o.user_name || "Customer",
        customerEmail: o.user_email || "",
        status: o.status,
        items: (itemsByOrder.get(o.id) || []).map((it) => ({
          id: 0,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image || "/products/item1.jpg",
        })),
        total: Number(o.total || 0),
        shippingAddress,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        tracking: o.tracking || undefined,
        notes: o.notes || undefined,
        createdAt: typeof o.created_at === 'string' ? o.created_at : new Date(o.created_at).toISOString(),
        updatedAt: typeof o.updated_at === 'string' ? o.updated_at : new Date(o.updated_at).toISOString(),
      }
    })

    return NextResponse.json({ data, page, pageSize, total })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch orders" }, { status: 500 })
  }
}
