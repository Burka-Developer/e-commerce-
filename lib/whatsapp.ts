import type { OrderEmailPayload } from "./mail"

// Send a WhatsApp message via Twilio REST API without adding new deps
// Requires env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER, ADMIN_WHATSAPP_NUMBER
export function formatMessage(order: OrderEmailPayload): string {
  const fmt = (process.env.WHATSAPP_FORMAT || "json").toLowerCase()
  const currency = order.totals.currency || "SAR"
  const header = `New order #${order.orderId} • ${currency} ${order.totals.total.toFixed(2)}`
  if (fmt === "compact") {
    const maxItems = 3
    const items = order.items
      .slice(0, maxItems)
      .map((it) => `- ${it.name} x${it.quantity} — ${currency} ${(it.price * it.quantity).toFixed(2)}`)
      .join("\n")
    const more = order.items.length > maxItems ? `\n… and ${order.items.length - maxItems} more items` : ""
    const lines = [
      header,
      `Customer: ${order.user.name} (${order.user.email})`,
      `Items (${order.items.length}):`,
      items + more,
      `Totals: Subtotal ${currency} ${order.totals.subtotal.toFixed(2)}, Tax ${currency} ${order.totals.tax.toFixed(2)}, Shipping ${currency} ${order.totals.shipping.toFixed(2)}, Discount ${currency} ${order.totals.discount.toFixed(2)}, Total ${currency} ${order.totals.total.toFixed(2)}`,
      `Shipping: ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`,
      `Payment: ${order.paymentMethod}` + (order.couponCode ? ` • Coupon: ${order.couponCode}` : ""),
      order.notes ? `Notes: ${order.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n")
    return lines
  }

  const minimal = {
    orderId: order.orderId,
    user: { name: order.user.name, email: order.user.email },
    totals: order.totals,
    items: order.items.map((it) => ({ name: it.name, qty: it.quantity, price: it.price })),
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    couponCode: order.couponCode || undefined,
    notes: order.notes || undefined,
  }
  let bodyText = `${header}\n\n${JSON.stringify(minimal, null, 2)}`
  if (bodyText.length > 3500) {
    const truncated = {
      ...minimal,
      items: minimal.items.slice(0, 10),
      _truncated: `Items truncated: ${minimal.items.length - 10} more...`,
    }
    bodyText = `${header}\n\n${JSON.stringify(truncated, null, 2)}`
  }
  return bodyText
}

export async function sendWhatsAppOrderNotification(order: OrderEmailPayload) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  // Optional API Key auth (SK... + secret). If present, prefer this for Basic auth.
  const apiKeySid = process.env.TWILIO_API_KEY_SID
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER
  const toNumber = process.env.ADMIN_WHATSAPP_NUMBER

  if (!sid || !token || !fromNumber || !toNumber) {
    console.log("[whatsapp] Twilio env not fully configured. Skipping WhatsApp notify.")
    return { ok: true, dev: true }
  }

  // Twilio WhatsApp requires the 'whatsapp:' prefix. Always trim to avoid trailing spaces breaking the channel match.
  const rawFrom = fromNumber.trim()
  const rawTo = toNumber.trim()
  const from = rawFrom.startsWith("whatsapp:") ? rawFrom : `whatsapp:${rawFrom}`
  const to = rawTo.startsWith("whatsapp:") ? rawTo : `whatsapp:${rawTo}`

  // Build a compact JSON payload for WhatsApp, keep length reasonable
  const bodyText = formatMessage(order)

  const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`

  const basicUser = apiKeySid?.trim() || sid
  const basicPass = apiKeySecret?.trim() || token
  const auth = Buffer.from(`${basicUser}:${basicPass}`).toString("base64")
  const params = new URLSearchParams({ To: to, Body: bodyText })
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim()
  if (messagingServiceSid) {
    // Prefer Messaging Service when provided; it must include a WhatsApp sender
    params.set("MessagingServiceSid", messagingServiceSid)
  } else {
    params.set("From", from)
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    // Prevent blocking the response in case Twilio is slow
    cache: "no-store",
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => "")
    // Improve visibility for common mistakes like 63007 (From not a recognized WhatsApp sender)
    try {
      const err = JSON.parse(errorText)
      if (err?.code === 63007) {
        console.error(
          "[whatsapp] Twilio error 63007: From not recognized as WhatsApp channel. Ensure TWILIO_WHATSAPP_NUMBER is an approved WhatsApp sender, or set TWILIO_MESSAGING_SERVICE_SID bound to a WhatsApp sender.",
        )
      }
    } catch {}
    console.error("[whatsapp] Twilio send failed:", res.status, errorText)
    return { ok: false, status: res.status, errorText }
  }

  const data = await res.json().catch(() => null) as any
  return { ok: true, sid: data?.sid }
}
