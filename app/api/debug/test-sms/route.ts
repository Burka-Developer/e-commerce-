import { NextResponse } from "next/server"
import { sendSmsOrderNotification } from "@/lib/sms"
import { formatMessage } from "@/lib/whatsapp"

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  const sample = {
    orderId: "#TEST123",
    user: { id: 1, name: "Test User", email: "test@example.com" },
    items: [
      { name: "Sample Product A", price: 50, quantity: 1 },
      { name: "Sample Product B", price: 25, quantity: 2 },
    ],
    shippingAddress: {
      firstName: "Test",
      lastName: "User",
      address: "123 Demo St",
      city: "Riyadh",
      state: "",
      zipCode: "12345",
      country: "Saudi Arabia",
    },
    paymentMethod: "cash-on-delivery",
    totals: { subtotal: 100, tax: 15, shipping: 0, discount: 0, total: 115, currency: "SAR" },
    notes: "This is a test SMS",
    couponCode: undefined,
  }

  const url = new URL(req.url)
  const dry = url.searchParams.get("dry") === "1"
  const preview = formatMessage(sample as any)

  if (dry) {
    return NextResponse.json({ ok: true, preview, note: "Dry run only; no SMS sent" })
  }

  const res = await sendSmsOrderNotification(sample as any)
  return NextResponse.json({ ok: true, preview, result: res })
}
