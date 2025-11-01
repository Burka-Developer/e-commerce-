import { NextResponse } from "next/server"
import { findUserByEmail } from "@/lib/auth"
import { query } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/mail"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`auth:resend:${ip}`, Number(process.env.AUTH_RATE_LIMIT_PER_MIN || 10), 60)
    if (!ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 })

    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 })

    const user = await findUserByEmail(email)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (user.is_verified === 1 || user.is_verified === true) {
      return NextResponse.json({ message: "Already verified" })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    await query(
      `UPDATE users SET verification_code = ?, verification_expires = ? WHERE id = ?`,
      [code, expires, user.id],
    )

    await sendVerificationEmail(email, code, user.name)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Resend failed" }, { status: 500 })
  }
}
