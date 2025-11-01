import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SESSION_COOKIE = "session"
const ISSUER = "108-ecommerce"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  return new TextEncoder().encode(secret)
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Auto-logout is a dev-only helper. Default is OFF to avoid breaking auth flows.
  const alwaysLogout =
    (process.env.ALWAYS_LOGOUT_ON_LOAD || "false").toLowerCase() === "true" &&
    process.env.NODE_ENV !== "production"

  // Auto-logout on every site load (except API and admin routes)
  if (alwaysLogout && !pathname.startsWith("/api") && !pathname.startsWith("/admin")) {
    const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value)
    if (hasSession) {
      const res = NextResponse.next()
      res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 })
      return res
    }
  }

  // Protect admin pages (allow unauthenticated access to /admin/auth for login)
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/auth") {
      return NextResponse.next()
    }
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = "/admin/auth"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
    try {
      const secret = getJwtSecret()
      if (!secret) {
        // Do NOT trust unsigned cookies. If JWT_SECRET is missing, block access.
        const url = req.nextUrl.clone()
        url.pathname = "/auth"
        return NextResponse.redirect(url)
      }
      const { payload } = await jwtVerify(token, secret, { issuer: ISSUER })
      if (payload.role !== "admin") {
        const url = req.nextUrl.clone()
        url.pathname = "/admin/auth"
        return NextResponse.redirect(url)
      }
      return NextResponse.next()
    } catch {
      const url = req.nextUrl.clone()
      url.pathname = "/admin/auth"
      return NextResponse.redirect(url)
    }
  }

  // Protect authenticated user pages
  const protectedUserPaths = ["/checkout", "/orders", "/profile"]
  if (protectedUserPaths.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = "/auth"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
    try {
      const secret = getJwtSecret()
      if (!secret) {
        const url = req.nextUrl.clone()
        url.pathname = "/auth"
        return NextResponse.redirect(url)
      }
      await jwtVerify(token, secret, { issuer: ISSUER })
      return NextResponse.next()
    } catch {
      const url = req.nextUrl.clone()
      url.pathname = "/auth"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/orders", "/profile"],
}
