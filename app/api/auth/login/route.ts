import { NextResponse } from "next/server"
import { findUserByEmail, verifyPassword, createSession } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "local"
    const ok = await checkRateLimit(`auth:login:${ip}`, Number(process.env.AUTH_RATE_LIMIT_PER_MIN || 20), 60)
    if (!ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 })

    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 })

    // Optional admin login via environment-provided credentials only (no insecure defaults)
    const configuredAdminEmail = process.env.ADMIN_EMAIL
    const configuredAdminPassword = process.env.ADMIN_PASSWORD
    if (configuredAdminEmail && configuredAdminPassword && email.toLowerCase() === configuredAdminEmail.toLowerCase()) {
      if (password !== configuredAdminPassword) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
      const sessionUser = { id: 9999, name: "Admin", email: configuredAdminEmail, phone: null, role: "admin" as const }
      try {
        await createSession(sessionUser)
      } catch (err: any) {
        return NextResponse.json({ error: "Session setup failed. Set JWT_SECRET in environment." }, { status: 500 })
      }
      return NextResponse.json({ user: sessionUser })
    }

    // Demo-only bypass: if enabled, allow hardcoded demo users without DB
    if (process.env.DEMO_AUTH_ENABLED === "true") {
      const demoAdminEmail = process.env.DEMO_ADMIN_EMAIL || "admin@demo.local"
      const demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD || "ChangeMe123!"
      const demoUserEmail = process.env.DEMO_USER_EMAIL || "user@demo.local"
      const demoUserPassword = process.env.DEMO_USER_PASSWORD || "password123"

      if (email === demoAdminEmail && password === demoAdminPassword) {
        const sessionUser = { id: 1, name: "Demo Admin", email: demoAdminEmail, phone: null, role: "admin" as const }
        try {
          await createSession(sessionUser)
        } catch (err: any) {
          return NextResponse.json({ error: "Session setup failed. Set JWT_SECRET in environment." }, { status: 500 })
        }
        return NextResponse.json({ user: sessionUser })
      }
      if (email === demoUserEmail && password === demoUserPassword) {
        const sessionUser = { id: 2, name: "Demo User", email: demoUserEmail, phone: null, role: "user" as const }
        try {
          await createSession(sessionUser)
        } catch (err: any) {
          return NextResponse.json({ error: "Session setup failed. Set JWT_SECRET in environment." }, { status: 500 })
        }
        return NextResponse.json({ user: sessionUser })
      }
      // If demo mode enabled but credentials don't match, fall through to normal auth
    }

    const user = await findUserByEmail(email)
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    if (user.is_verified === 0 || user.is_verified === false) {
      return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 403 })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const sessionUser = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    try {
      await createSession(sessionUser)
    } catch (err: any) {
      return NextResponse.json({ error: "Session setup failed. Set JWT_SECRET in environment." }, { status: 500 })
    }

    return NextResponse.json({ user: sessionUser })
  } catch (e: any) {
    console.error("/api/auth/login error:", e?.message || e)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
