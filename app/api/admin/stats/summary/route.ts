import { NextResponse } from "next/server"
import { getAuthFromCookies } from "@/lib/auth"
import { query } from "@/lib/db"

type Summary = {
  totalRevenue: number
  orderCount: number
  customerCount: number
  productCount: number
  paidOrderCount: number
}

export async function GET() {
  const auth = await getAuthFromCookies()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Demo mode: return mock data without hitting the database
  if (process.env.DEMO_AUTH_ENABLED === "true") {
    const payload: Summary = {
      totalRevenue: 45231.87,
      orderCount: 312,
      customerCount: 128,
      productCount: 64,
      paidOrderCount: 241,
    }
    return NextResponse.json(payload)
  }

  try {
    const [orders] =
      (await query<Array<{ total_revenue: string | null; order_count: number; paid_orders: number }>>(`
        SELECT
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) AS total_revenue,
          COUNT(*) AS order_count,
          SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_orders
        FROM orders
      `)) ?? [{ total_revenue: "0", order_count: 0, paid_orders: 0 }]

    const [customers] =
      (await query<Array<{ customer_count: number }>>(`SELECT COUNT(*) AS customer_count FROM users WHERE role = 'user'`)) ?? [
        { customer_count: 0 },
      ]

    const [products] =
      (await query<Array<{ product_count: number }>>(`SELECT COUNT(*) AS product_count FROM products`)) ?? [
        { product_count: 0 },
      ]

    const payload: Summary = {
      totalRevenue: Number(orders.total_revenue ?? 0),
      orderCount: Number(orders.order_count ?? 0),
      customerCount: Number(customers.customer_count ?? 0),
      productCount: Number(products.product_count ?? 0),
      paidOrderCount: Number(orders.paid_orders ?? 0),
    }

    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json<Summary>(
      {
        totalRevenue: 0,
        orderCount: 0,
        customerCount: 0,
        productCount: 0,
        paidOrderCount: 0,
      },
      { status: 200 },
    )
  }
}
