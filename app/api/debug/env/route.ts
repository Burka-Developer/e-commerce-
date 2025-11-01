import { NextResponse } from "next/server"

export async function GET() {
  // Dev-only helper to verify env and runtime
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }
  return NextResponse.json({
    jwtSecretPresent: Boolean(process.env.JWT_SECRET),
    node: process.version,
    env: process.env.NODE_ENV,
  })
}
