import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      error: "WhatsApp notifications are disabled",
      hint: "Use /api/debug/test-sms for SMS testing",
    },
    { status: 410 },
  )
}
