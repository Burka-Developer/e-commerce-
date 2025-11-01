import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { query } from "./db"

const SESSION_COOKIE = "session"
const ISSUER = "108-ecommerce"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("Missing JWT_SECRET environment variable")
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export type SessionUser = {
  id: number
  name: string
  email: string
  role: "user" | "admin"
  phone?: string | null
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Only set secure cookies in production (localhost/dev often uses http)
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { issuer: ISSUER })
    return {
      id: Number(payload.sub),
      name: (payload.name as string) || "",
      email: (payload.email as string) || "",
      role: (payload.role as "user" | "admin") || "user",
      phone: (payload.phone as string | null) ?? null,
    }
  } catch {
    return null
  }
}

export async function requireAdmin() {
  const user = await getSessionUser()
  if (!user || user.role !== "admin") return null
  const allowedAdminEmail = process.env.ADMIN_EMAIL
  // If ADMIN_EMAIL is configured, enforce it. Otherwise accept any user with role=admin.
  if (allowedAdminEmail && user.email.toLowerCase() !== allowedAdminEmail.toLowerCase()) return null
  return user
}

// DB helpers
export async function findUserByEmail(email: string) {
  const rows = await query<any[]>(
    "SELECT id, name, email, phone, role, password_hash, is_verified, verification_code, verification_expires FROM users WHERE email = ?",
    [email],
  )
  return rows[0] || null
}

export async function insertUser({
  name,
  email,
  phone,
  passwordHash,
  role,
}: {
  name: string
  email: string
  phone?: string | null
  passwordHash: string
  role: "user" | "admin"
}) {
  const result = await query<any>("INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)", [
    name,
    email,
    phone ?? null,
    passwordHash,
    role,
  ])
  return result
}

export async function getAuthFromCookies() {
  // Reuse existing session logic
  return getSessionUser()
}
