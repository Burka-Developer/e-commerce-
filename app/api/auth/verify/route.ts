import { NextResponse } from "next/server"
import { findUserByEmail, createSession } from "@/lib/auth"
import { query } from "@/lib/db"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`auth:verify:${ip}`, Number(process.env.AUTH_RATE_LIMIT_PER_MIN || 30), 60)
    if (!ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 })

    const { email, code } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (user.is_verified === 1 || user.is_verified === true) {
      return NextResponse.json({ message: "Already verified" })
    }

    const now = new Date()
    const expires = user.verification_expires ? new Date(user.verification_expires) : null
    const valid = String(user.verification_code || "") === String(code) && (!expires || expires > now)
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    await query(
      `UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires = NULL WHERE id = ?`,
      [user.id],
    )

    const sessionUser = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    try {
      await createSession(sessionUser)
    } catch (e) {
      return NextResponse.json({ error: "Session setup failed" }, { status: 500 })
    }

    return NextResponse.json({ user: sessionUser })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Verification failed" }, { status: 500 })
  }
}
