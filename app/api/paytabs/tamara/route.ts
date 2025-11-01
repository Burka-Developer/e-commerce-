import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`paytabs:tamara:${ip}`, Number(process.env.PAYMENT_RATE_LIMIT_PER_MIN || 10), 60)
    if (!ok) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })

    const BodySchema = z.object({
      cart_amount: z.number().positive(),
      cart_currency: z.string().min(1),
      cart_description: z.string().min(1),
      cart_id: z.string().min(1),
      return: z.string().url(),
      customer_details: z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        street1: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
      }),
    })
    const paymentData = BodySchema.parse(await request.json())

    // Tamara integration
    const tamaraResponse = await fetch("https://api-sandbox.tamara.co/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.TAMARA_SECRET_KEY}`
      },
      body: JSON.stringify({
        order_reference_id: paymentData.cart_id,
        total_amount: {
          amount: paymentData.cart_amount,
          currency: paymentData.cart_currency
        },
        description: paymentData.cart_description,
        country_code: "SA",
        payment_type: "PAY_BY_INSTALMENTS",
        locale: "ar_SA",
        order_number: paymentData.cart_id,
        tax_amount: {
          amount: "0.00",
          currency: paymentData.cart_currency
        },
        shipping_amount: {
          amount: "0.00",
          currency: paymentData.cart_currency
        },
        discount_amount: {
          amount: "0.00",
          currency: paymentData.cart_currency
        },
        items: [
          {
            reference_id: paymentData.cart_id,
            type: "fashion",
            name: paymentData.cart_description,
            sku: paymentData.cart_id,
            quantity: 1,
            unit_price: {
              amount: paymentData.cart_amount,
              currency: paymentData.cart_currency
            },
            total_amount: {
              amount: paymentData.cart_amount,
              currency: paymentData.cart_currency
            },
            discount_amount: {
              amount: "0.00",
              currency: paymentData.cart_currency
            },
            reference: paymentData.cart_id,
            image_url: "",
            categories: [["fashion"]]
          }
        ],
        consumer: {
          first_name: paymentData.customer_details.name.split(" ")[0] || "",
          last_name: paymentData.customer_details.name.split(" ").slice(1).join(" ") || "",
          phone_number: paymentData.customer_details.phone,
          email: paymentData.customer_details.email,
          national_id: "",
          date_of_birth: "",
          is_first_order: true
        },
        billing_address: {
          first_name: paymentData.customer_details.name.split(" ")[0] || "",
          last_name: paymentData.customer_details.name.split(" ").slice(1).join(" ") || "",
          line1: paymentData.customer_details.street1,
          city: paymentData.customer_details.city,
          country_code: paymentData.customer_details.country,
          phone_number: paymentData.customer_details.phone
        },
        shipping_address: {
          first_name: paymentData.customer_details.name.split(" ")[0] || "",
          last_name: paymentData.customer_details.name.split(" ").slice(1).join(" ") || "",
          line1: paymentData.customer_details.street1,
          city: paymentData.customer_details.city,
          country_code: paymentData.customer_details.country,
          phone_number: paymentData.customer_details.phone
        },
        merchant_urls: {
          success: paymentData.return,
          failure: paymentData.return,
          cancel: paymentData.return,
          notification: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paytabs/tamara/webhook`
        },
        platform: "108",
        is_mobile: false,
        risk_assessment: {
          triggers: []
        }
      })
    })

    const tamaraResult = await tamaraResponse.json()
    
    if (tamaraResult.checkout_url) {
      return NextResponse.json({
        success: true,
        checkout_url: tamaraResult.checkout_url,
        order_id: tamaraResult.order_id
      })
    } else {
      return NextResponse.json(
        { error: "Tamara checkout initialization failed" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Tamara integration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


