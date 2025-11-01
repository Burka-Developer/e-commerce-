import { NextResponse } from "next/server"
import { findUserByEmail } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendPasswordResetEmail } from "@/lib/mail"
import { SignJWT } from "jose"

const ISSUER = "108-ecommerce"

async function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("Missing JWT_SECRET environment variable")
  return new TextEncoder().encode(secret)
}

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`auth:forgot:${ip}`, Number(process.env.AUTH_RATE_LIMIT_PER_MIN || 10), 60)
    if (!ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 })

    const { email } = await req.json().catch(() => ({}))
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    // Don't reveal account existence
    const user = await findUserByEmail(email).catch(() => null)
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    // Generate a short-lived reset token (JWT)
    const secret = await getJwtSecret()
    const token = await new SignJWT({ type: "pwd-reset", sub: String(user.id), email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(ISSUER)
      .setIssuedAt()
      .setExpirationTime("30m")
      .sign(secret)

    const origin = (() => {
      try {
        const url = new URL(req.url)
        return `${url.protocol}//${url.host}`
      } catch {
        return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }
    })()

    const link = `${origin}/auth/forgot-password?token=${encodeURIComponent(token)}`
    await sendPasswordResetEmail(email, link, user.name)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Request failed" }, { status: 500 })
  }
}
