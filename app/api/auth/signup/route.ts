import { NextResponse } from "next/server"
import { findUserByEmail, hashPassword } from "@/lib/auth"
import { query } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/mail"
import { checkRateLimit } from "@/lib/rate-limit"

const phoneRegex = /^\+?[0-9\s-]{7,20}$/

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`auth:signup:${ip}`, Number(process.env.AUTH_RATE_LIMIT_PER_MIN || 10), 60)
    if (!ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 })

    const { name, email, password, phone, adminToken } = await req.json()

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }

    const existing = await findUserByEmail(email)
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })

    // Optional: ensure phone unique
    const phoneExisting = await query<any[]>("SELECT id FROM users WHERE phone = ?", [phone])
    if (phoneExisting.length > 0) {
      return NextResponse.json({ error: "Phone already in use" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    // For security, never auto-assign admin via signup
    const role: "user" | "admin" = "user"

    // Generate a 6-digit numeric verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Insert user as unverified with verification code
    const result: any = await query(
      `INSERT INTO users (name, email, phone, password_hash, role, is_verified, verification_code, verification_expires)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [name, email, phone ?? null, passwordHash, role, code, expires],
    )

    try {
      await sendVerificationEmail(email, code, name)
    } catch (e) {
      // If email fails, keep user row but report the error
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again.", pending: true, email },
        { status: 500 },
      )
    }

    // Do not create session yet; require verification first
    return NextResponse.json({ pending: true, email }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
