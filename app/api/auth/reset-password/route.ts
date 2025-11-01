import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { checkRateLimit } from "@/lib/rate-limit"
import { hashPassword } from "@/lib/auth"
import { query } from "@/lib/db"

const ISSUER = "108-ecommerce"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("Missing JWT_SECRET environment variable")
  return new TextEncoder().encode(secret)
}

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`auth:reset:${ip}`, Number(process.env.AUTH_RATE_LIMIT_PER_MIN || 10), 60)
    if (!ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 })

    const { token, newPassword } = await req.json().catch(() => ({}))
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Verify token
    const { payload } = await jwtVerify(token, getJwtSecret(), { issuer: ISSUER })
    if (payload.type !== "pwd-reset" || !payload.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }
    const userId = Number(payload.sub)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid token subject" }, { status: 400 })
    }

    // Update password
    const passwordHash = await hashPassword(newPassword)
    await query(
      `UPDATE users SET password_hash = ?, verification_code = NULL, verification_expires = NULL WHERE id = ?`,
      [passwordHash, userId],
    )

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Reset failed" }, { status: 400 })
  }
}
