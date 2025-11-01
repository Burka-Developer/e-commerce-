import type { OrderEmailPayload } from "./mail"
import { formatMessage } from "./whatsapp"

// Send plain SMS via Twilio's Messages API
// Env options:
// - TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN (default)
// - or TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET (preferred)
// - One of: TWILIO_MESSAGING_SERVICE_SID or TWILIO_SMS_FROM (E.164, e.g., +15551234567)
// - ADMIN_SMS_TO (E.164)
export async function sendSmsOrderNotification(order: OrderEmailPayload) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const apiKeySid = process.env.TWILIO_API_KEY_SID
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET
  const fromNumber = process.env.TWILIO_SMS_FROM?.trim()
  const toNumber = process.env.ADMIN_SMS_TO?.trim()
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim()

  if (!accountSid || (!authToken && !(apiKeySid && apiKeySecret))) {
    console.log("[sms] Twilio credentials missing; skipping SMS notify.")
    return { ok: true, dev: true }
  }
  if (!toNumber || (!fromNumber && !messagingServiceSid)) {
    console.log("[sms] SMS env not fully configured (need ADMIN_SMS_TO and From or MessagingServiceSid); skipping.")
    return { ok: true, dev: true }
  }

  const bodyText = formatMessage(order) // reuse compact formatting if set

  const apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`
  const basicUser = (apiKeySid || accountSid) as string
  const basicPass = (apiKeySecret || authToken) as string
  const auth = Buffer.from(`${basicUser}:${basicPass}`).toString("base64")

  const params = new URLSearchParams({ To: toNumber, Body: bodyText })
  if (messagingServiceSid) {
    params.set("MessagingServiceSid", messagingServiceSid)
  } else if (fromNumber) {
    params.set("From", fromNumber)
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => "")
    console.error("[sms] Twilio SMS send failed:", res.status, errorText)
    return { ok: false, status: res.status, errorText }
  }
  const data = (await res.json().catch(() => null)) as any
  return { ok: true, sid: data?.sid }
}
