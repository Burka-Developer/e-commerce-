import { NextResponse } from "next/server"

// All chat endpoints are retired. The chatbot is now client-only and uses local FAQ data.
export async function POST() {
  return NextResponse.json(
    { error: "Chat streaming disabled. Chatbot runs locally and does not use API endpoints." },
    { status: 410 },
  )
}
