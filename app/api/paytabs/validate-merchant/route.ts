import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`paytabs:val:${ip}`, Number(process.env.PAYMENT_RATE_LIMIT_PER_MIN || 10), 60)
    if (!ok) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })

    const BodySchema = z.object({ validationURL: z.string().url() }).passthrough()
    const { validationURL, ...paymentData } = BodySchema.parse(await request.json())

    // PayTabs merchant validation
    const response = await fetch("https://secure.paytabs.sa/payment/validate-merchant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.PAYTABS_SERVER_KEY || ""
      },
      body: JSON.stringify({
        validationURL,
        ...paymentData
      })
    })

    const result = await response.json()
    
    if (result.merchantSession) {
      return NextResponse.json(result.merchantSession)
    } else {
      return NextResponse.json(
        { error: "Merchant validation failed" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Merchant validation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


