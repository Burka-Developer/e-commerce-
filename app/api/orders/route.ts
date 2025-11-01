import { NextResponse } from "next/server"
import { z } from "zod"
import { getSessionUser } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendOrderNotificationEmail, type OrderEmailPayload } from "@/lib/mail"
import { sendSmsOrderNotification } from "@/lib/sms"
import { withTransaction, query } from "@/lib/db"

const ItemSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  image: z.string().optional().nullable(),
})

const ShippingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
})

const BodySchema = z.object({
  orderId: z.string().min(1).optional(),
  items: z.array(ItemSchema).min(1),
  totals: z
    .object({
      subtotal: z.number().nonnegative().optional(),
      tax: z.number().nonnegative().default(0),
      shipping: z.number().nonnegative().default(0),
      discount: z.number().nonnegative().default(0),
      total: z.number().nonnegative().optional(),
      currency: z.string().optional(),
    })
    .default({ tax: 0, shipping: 0, discount: 0 }),
  shippingAddress: ShippingSchema,
  paymentMethod: z.string().min(1),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`orders:create:${ip}`, Number(process.env.ORDERS_RATE_LIMIT_PER_MIN || 20), 60)
    if (!ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = BodySchema.parse(await req.json())

    // Recompute subtotal on the server for safety
    const subtotal = body.items.reduce((sum, it) => sum + it.price * it.quantity, 0)
    const discount = body.totals.discount || 0
    const tax = body.totals.tax || 0
    const shipping = body.totals.shipping || 0
    const total = Math.max(0, subtotal + tax + shipping - discount)
    const currency = body.totals.currency || "SAR"

  const orderId = body.orderId || `#${Date.now().toString().slice(-6)}`

    const payload: OrderEmailPayload = {
      orderId,
      user: { id: user.id, name: user.name, email: user.email },
      items: body.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      couponCode: body.couponCode,
      totals: { subtotal, tax, shipping, discount, total, currency },
    }

    // Persist order when DB is configured and demo mode is off; otherwise proceed with notifications only
    let persistedOrderId: number | null = null
    if (process.env.DEMO_AUTH_ENABLED !== "true") {
      try {
        await withTransaction(async (conn) => {
          // Insert into orders table
          const orderRes: any = await conn.execute(
            `INSERT INTO orders (user_id, status, total, shipping, payment_method, payment_status, coupon_code, discount, notes)
             VALUES (?, 'pending', ?, ?, ?, 'pending', ?, ?, ?)`,
            [
              user.id,
              total,
              JSON.stringify(body.shippingAddress),
              body.paymentMethod,
              body.couponCode ?? null,
              discount || 0,
              body.notes ?? null,
            ],
          )
          // mysql2 returns result as [ResultSetHeader, fields]; in pooled connection execute returns ResultSetHeader directly
          const insertId = (orderRes as any)?.insertId ?? (Array.isArray(orderRes) ? (orderRes[0] as any)?.insertId : null)
          if (!insertId) throw new Error("Failed to create order")
          persistedOrderId = Number(insertId)

          // Insert order items
          if (body.items && body.items.length) {
            const values: any[] = []
            const placeholders: string[] = []
            for (const it of body.items) {
              placeholders.push("(?, ?, ?, ?, ?, ?)")
              values.push(
                persistedOrderId,
                Number(it.id) || null,
                it.name,
                it.price,
                it.quantity,
                it.image ?? null,
              )
            }
            await conn.execute(
              `INSERT INTO order_items (order_id, product_id, name, price, quantity, image) VALUES ${placeholders.join(", ")}`,
              values,
            )
          }
        })
      } catch (dbErr: any) {
        // If DB not configured or failed, continue without blocking checkout; log for diagnostics
        console.warn("[orders] DB persistence skipped:", dbErr?.message || dbErr)
      }
    }

    await sendOrderNotificationEmail(payload)
    // SMS notification to admin (only channel). Fire-and-forget.
    if (process.env.ADMIN_SMS_TO && (process.env.TWILIO_SMS_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID)) {
      sendSmsOrderNotification(payload).catch((e) => console.error("[orders] SMS notify error:", e))
    } else {
      console.log("[orders] SMS not sent - missing ADMIN_SMS_TO or TWILIO_SMS_FROM / TWILIO_MESSAGING_SERVICE_SID")
    }

    return NextResponse.json({ ok: true, orderId, id: persistedOrderId ?? undefined })
  } catch (e: any) {
    const msg = e?.message || String(e)
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
