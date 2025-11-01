import { NextResponse } from "next/server"

// This endpoint has been retired. The chatbot now runs fully on the client using local FAQs.
export async function POST() {
  return NextResponse.json(
    { error: "Chat API disabled. The chatbot is local and does not call external AI." },
    { status: 410 },
  )
}
