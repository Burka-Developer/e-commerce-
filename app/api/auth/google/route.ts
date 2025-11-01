import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { findUserByEmail, createSession, hashPassword } from "@/lib/auth"
import { query } from "@/lib/db"

// This route accepts a Google ID token from the client, validates it via
// Google's tokeninfo endpoint, ensures the user exists in our DB, then
// creates a session cookie with our existing session logic.
export async function POST(req: Request) {
  try {
    const { id_token } = await req.json()
    console.log('POST /api/auth/google - id_token received:', id_token ? id_token.substring(0, 20) + '...' : 'missing')
    
    if (!id_token) {
      console.error('Missing id_token in request body')
      return NextResponse.json({ error: "Missing id_token" }, { status: 400 })
    }

    // Validate token with Google
    console.log('Validating token with Google...')
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
      id_token,
    )}`)
    
    if (!googleRes.ok) {
      console.error('Google tokeninfo rejected token:', googleRes.status)
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 })
    }
    
    const payload = await googleRes.json()
    console.log('Token validated. Email:', payload.email, 'Verified:', payload.email_verified)

    // Validate audience (token should be issued for our client id)
    const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!expectedClientId) {
      console.error('Missing Google client ID in environment')
      return NextResponse.json({ error: "Server misconfigured: missing Google client id env" }, { status: 500 })
    }

    // tokeninfo returns aud and iss fields
    if (payload.aud !== expectedClientId) {
      console.error('Audience mismatch. Got:', payload.aud, 'Expected:', expectedClientId)
      return NextResponse.json({ error: "Token audience mismatch" }, { status: 401 })
    }

    const issuer = payload.iss
    if (!(issuer === "accounts.google.com" || issuer === "https://accounts.google.com")) {
      console.error('Invalid issuer:', issuer)
      return NextResponse.json({ error: "Invalid token issuer" }, { status: 401 })
    }

  // payload includes email, email_verified, name, sub (google id), picture
    const email = payload.email as string | undefined
    const name = payload.name as string | undefined
  const googleSub = payload.sub as string | undefined
    const email_verified = payload.email_verified === "true" || payload.email_verified === true

    if (!email || !email_verified) {
      console.error('Email missing or not verified:', { email, email_verified })
      return NextResponse.json({ error: "Unverified Google account" }, { status: 401 })
    }

    // DEMO mode: bypass DB and create a session-only user
    if (process.env.DEMO_AUTH_ENABLED === "true") {
      console.log('DEMO_AUTH_ENABLED=true -> bypassing DB for Google sign-in')
      const sessionUser = {
        id: 1000, // ephemeral id for demo
        name: name || "Google User",
        email,
        phone: null as string | null,
        role: "user" as const,
      }
      try {
        await createSession(sessionUser)
      } catch (err: any) {
        console.error('Session creation failed (demo):', err?.message)
        return NextResponse.json({ error: "Session setup failed. Set JWT_SECRET in environment." }, { status: 500 })
      }
      return NextResponse.json({ user: sessionUser })
    }

    // Normal mode: ensure user exists in DB
    console.log('Looking up user by email:', email)
    let user
    try {
      user = await findUserByEmail(email)
    } catch (dbErr: any) {
      console.error('DB error in findUserByEmail:', dbErr?.message || dbErr)
      return NextResponse.json({ error: "Database unavailable. Check MySQL connection settings." }, { status: 503 })
    }
    
    if (!user) {
      console.log('User not found, creating new user with Google link...')
      const placeholderPassword = randomBytes(16).toString("hex")
      const hashedPlaceholder = await hashPassword(placeholderPassword)
      try {
        const result: any = await query(
          `INSERT INTO users (name, email, phone, password_hash, role, is_verified, verification_code, verification_expires, google_sub)
           VALUES (?, ?, ?, ?, 'user', 1, NULL, NULL, ?)`,
          [name || "", email, null, hashedPlaceholder, googleSub || null],
        )
        const id = Number(result.insertId)
        console.log('User created with ID:', id)
        user = { id, name: name || "", email, phone: null, role: "user", password_hash: hashedPlaceholder, is_verified: 1 }
      } catch (dbErr: any) {
        console.error('DB error creating user:', dbErr?.message || dbErr)
        return NextResponse.json({ error: "Database write failed. Check MySQL and migrations." }, { status: 503 })
      }
    } else {
      console.log('User found, ID:', user.id)
      try {
        // Link Google sub if not already linked and mark verified
        await query(
          `UPDATE users SET google_sub = COALESCE(google_sub, ?), is_verified = 1, verification_code = NULL, verification_expires = NULL, name = COALESCE(NULLIF(name, ''), ?) WHERE id = ?`,
          [googleSub || null, name || user.name || "", user.id],
        )
      } catch (e: any) {
        console.warn('Failed to update google_sub or verify user:', e?.message)
      }
    }

    const sessionUser = {
      id: user.id,
      name: user.name || name || "",
      email: user.email,
      phone: user.phone,
      role: user.role,
    }
    
    console.log('Creating session for user:', sessionUser.id)
    try {
      await createSession(sessionUser)
      console.log('Session created successfully')
    } catch (err: any) {
      console.error('Session creation failed:', err.message)
      return NextResponse.json({ error: "Session setup failed. Set JWT_SECRET in environment." }, { status: 500 })
    }

    console.log('Returning user data:', sessionUser)
    return NextResponse.json({ user: sessionUser })
  } catch (e: any) {
    console.error('Google sign-in endpoint error:', e.message, e.stack)
    return NextResponse.json({ error: e.message || "Google sign-in failed", details: e.stack }, { status: 500 })
  }
}
