import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionUser } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Require a logged-in user
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Basic per-IP rate limit
    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`paytabs:req:${ip}`, Number(process.env.PAYMENT_RATE_LIMIT_PER_MIN || 10), 60)
    if (!ok) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })

    const BodySchema = z.object({
      profile_id: z.string().min(1),
      tran_type: z.string().min(1),
      tran_class: z.string().min(1),
      cart_id: z.string().min(1),
      cart_currency: z.string().min(1),
      cart_amount: z.number().positive(),
      cart_description: z.string().min(1),
      customer_details: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(4),
        street1: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        country: z.string().min(1),
        zip: z.string().min(1),
      }),
      shipping_details: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(4),
        street1: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        country: z.string().min(1),
        zip: z.string().min(1),
      }),
      callback: z.string().url(),
      return: z.string().url(),
      hide_shipping: z.string().optional(),
      framed: z.string().optional(),
      payment_method: z.string().optional(),
    })

    const payload = BodySchema.parse(await request.json())

    // Validate env variables
    const serverKey = process.env.PAYTABS_SERVER_KEY
    if (!serverKey) {
      return NextResponse.json({ error: "Server key not configured" }, { status: 500 })
    }

    // Forward request to PayTabs securely
    const response = await fetch("https://secure.paytabs.sa/payment/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: serverKey,
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.ok ? 200 : 400 })
  } catch (error) {
    console.error("PayTabs request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



