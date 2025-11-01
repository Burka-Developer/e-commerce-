import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`paytabs:tabby:${ip}`, Number(process.env.PAYMENT_RATE_LIMIT_PER_MIN || 10), 60)
    if (!ok) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })

    const BodySchema = z.object({
      cart_amount: z.number().positive(),
      cart_currency: z.string().min(1),
      cart_description: z.string().min(1),
      cart_id: z.string().min(1),
      customer_details: z.object({ name: z.string(), email: z.string().email(), phone: z.string() }),
      return: z.string().url(),
    })
    const paymentData = BodySchema.parse(await request.json())

    // Tabby integration
    const tabbyResponse = await fetch("https://api-sandbox.tabby.ai/api/v2/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.TABBY_SECRET_KEY}`,
        "tabby-api-version": "2023-09-01"
      },
      body: JSON.stringify({
        payment: {
          amount: paymentData.cart_amount,
          currency: paymentData.cart_currency,
          description: paymentData.cart_description,
          buyer: {
            phone: paymentData.customer_details.phone,
            email: paymentData.customer_details.email,
            name: paymentData.customer_details.name
          },
          buyer_history: {
            registered_since: "2023-01-01T00:00:00+00:00",
            loyalty_level: 0
          },
          order: {
            tax_amount: "0.00",
            shipping_amount: "0.00",
            discount_amount: "0.00",
            updated_at: new Date().toISOString(),
            reference_id: paymentData.cart_id,
            items: [
              {
                title: paymentData.cart_description,
                description: paymentData.cart_description,
                quantity: 1,
                unit_price: paymentData.cart_amount,
                discount_amount: "0.00",
                reference_id: paymentData.cart_id,
                image_url: "",
                product_url: "",
                category: "fashion"
              }
            ]
          },
          order_history: [
            {
              purchased_at: new Date().toISOString(),
              amount: paymentData.cart_amount,
              payment_method: "card",
              status: "new"
            }
          ],
          meta: {
            order_id: paymentData.cart_id,
            customer: paymentData.customer_details.email,
            order: {
              reference_id: paymentData.cart_id
            }
          }
        },
        lang: "ar",
        merchant_code: process.env.TABBY_MERCHANT_CODE,
        merchant_urls: {
          success: paymentData.return,
          cancel: paymentData.return,
          failure: paymentData.return
        }
      })
    })

    const tabbyResult = await tabbyResponse.json()
    
    if (tabbyResult.payment && tabbyResult.payment.id) {
      return NextResponse.json({
        success: true,
        checkout_url: tabbyResult.payment.url,
        payment_id: tabbyResult.payment.id
      })
    } else {
      return NextResponse.json(
        { error: "Tabby checkout initialization failed" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Tabby integration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


