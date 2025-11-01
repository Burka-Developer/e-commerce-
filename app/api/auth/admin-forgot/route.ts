import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendAdminPasswordEmail } from "@/lib/mail"

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`auth:admin-forgot:${ip}`, Number(process.env.AUTH_RATE_LIMIT_PER_MIN || 10), 60)
    if (!ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 })

    const { email } = await req.json().catch(() => ({}))
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    const adminEmail = (process.env.ADMIN_EMAIL || "Almalkiadel711@gmail.com").toLowerCase()
    const adminPassword = process.env.ADMIN_PASSWORD || "udsbpo1.com@Kali.org"
    if (email.toLowerCase() !== adminEmail) {
      // Do not reveal; respond OK regardless
      return NextResponse.json({ ok: true })
    }

    await sendAdminPasswordEmail(adminEmail, adminPassword)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Request failed" }, { status: 500 })
  }
}
