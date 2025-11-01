import nodemailer from "nodemailer"

function getTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = (process.env.SMTP_SECURE || "false").toLowerCase() === "true"

  if (!host || !port || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export async function sendVerificationEmail(to: string, code: string, name?: string) {
  const from = process.env.SMTP_FROM || "no-reply@localhost"
  const transport = getTransport()
  const subject = "Verify your email"
  const displayName = name || "there"
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Welcome${displayName ? ", " + displayName : ""}!</h2>
      <p>Use the verification code below to complete your sign up.</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 12px 16px; background:#f2f4f7; display: inline-block; border-radius: 8px;">
        ${code}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn’t request this, you can ignore this email.</p>
    </div>
  `

  // In development without SMTP, log to server console to unblock flow
  if (!transport) {
    console.log(`[mail] SMTP not configured. Verification code for ${to}: ${code}`)
    return { ok: true, dev: true }
  }

  await transport.sendMail({ from, to, subject, html })
  return { ok: true }
}

// Utility: extract a plain email from SMTP_FROM like "Name <email@domain>"
function extractEmailAddress(addr: string): string {
  const m = addr.match(/<([^>]+)>/) || []
  return (m[1] || addr || "").trim().replace(/^"|"$/g, "")
}

export type OrderEmailPayload = {
  orderId: string
  user: { id: number; name: string; email: string }
  totals: { subtotal: number; tax: number; shipping: number; discount: number; total: number; currency?: string }
  items: Array<{ id?: number | string; name: string; price: number; quantity: number; image?: string | null }>
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  notes?: string
  couponCode?: string
}

export async function sendOrderNotificationEmail(order: OrderEmailPayload) {
  const transport = getTransport()
  const from = process.env.SMTP_FROM || "no-reply@localhost"
  const toOwner = process.env.ORDER_NOTIFY_TO || process.env.SMTP_USER || extractEmailAddress(from)

  const currency = order.totals.currency || "SAR"
  const subject = `New Order #${order.orderId} • ${currency} ${order.totals.total.toFixed(2)}`

  const itemsHtml = order.items
    .map(
      (it) => `
        <tr>
          <td style="padding:6px 8px;">${(it.name || "").replace(/</g, "&lt;")}</td>
          <td style="padding:6px 8px; text-align:center;">${it.quantity}</td>
          <td style="padding:6px 8px; text-align:right;">${currency} ${(it.price * it.quantity).toFixed(2)}</td>
        </tr>`,
    )
    .join("")

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif; line-height:1.5; color:#111">
      <h2 style="margin:0 0 8px">New Order Received</h2>
      <p style="margin:0 0 12px">Order <strong>#${order.orderId}</strong> placed by <strong>${
        order.user.name || "Customer"
      }</strong> (${order.user.email}).</p>

      <h3 style="margin:18px 0 6px;">Items</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border:1px solid #eee">
        <thead>
          <tr style="background:#f7f7f7">
            <th align="left" style="padding:6px 8px;">Item</th>
            <th align="center" style="padding:6px 8px;">Qty</th>
            <th align="right" style="padding:6px 8px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <h3 style="margin:18px 0 6px;">Totals</h3>
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding:2px 8px 2px 0">Subtotal:</td><td style="text-align:right">${currency} ${order.totals.subtotal.toFixed(2)}</td></tr>
        <tr><td style="padding:2px 8px 2px 0">Tax:</td><td style="text-align:right">${currency} ${order.totals.tax.toFixed(2)}</td></tr>
        <tr><td style="padding:2px 8px 2px 0">Shipping:</td><td style="text-align:right">${currency} ${order.totals.shipping.toFixed(2)}</td></tr>
        ${order.totals.discount > 0 ? `<tr><td style="padding:2px 8px 2px 0">Discount:</td><td style="text-align:right">- ${currency} ${order.totals.discount.toFixed(2)}</td></tr>` : ""}
        <tr><td style="padding:6px 8px 2px 0"><strong>Total:</strong></td><td style="text-align:right"><strong>${currency} ${order.totals.total.toFixed(2)}</strong></td></tr>
      </table>

      <h3 style="margin:18px 0 6px;">Shipping</h3>
      <p style="margin:0">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br/>
      ${order.shippingAddress.address}<br/>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br/>
      ${order.shippingAddress.country}</p>

      <p style="margin:12px 0 0">Payment Method: <strong>${order.paymentMethod}</strong>$${order.couponCode ? ` • Coupon: <strong>${order.couponCode}</strong>` : ""}</p>
      ${order.notes ? `<p style="margin:8px 0 0">Notes: ${order.notes.replace(/</g, "&lt;")}</p>` : ""}
    </div>
  `

  if (!transport) {
    console.log(`[mail] SMTP not configured. Order #${order.orderId} notification would be sent to ${toOwner}.`)
    return { ok: true, dev: true }
  }

  await transport.sendMail({ from, to: toOwner, subject, html })
  return { ok: true }
}

export async function sendPasswordResetEmail(to: string, resetLink: string, name?: string) {
  const transport = getTransport()
  const from = process.env.SMTP_FROM || "no-reply@localhost"
  const subject = "Reset your password"
  const displayName = name || "there"
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Hello${displayName ? ", " + displayName : ""}</h2>
      <p>We received a request to reset your password. Click the button below to set a new password. This link will expire shortly.</p>
      <p style="margin:16px 0;">
        <a href="${resetLink}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">${resetLink}</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `

  if (!transport) {
    console.log(`[mail] SMTP not configured. Password reset link for ${to}: ${resetLink}`)
    return { ok: true, dev: true }
  }

  await transport.sendMail({ from, to, subject, html })
  return { ok: true }
}

export async function sendAdminPasswordEmail(to: string, password: string) {
  const transport = getTransport()
  const from = process.env.SMTP_FROM || "no-reply@localhost"
  const subject = "Your admin password"
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Admin Password</h2>
      <p>You requested your admin password. Here it is:</p>
      <div style="font-size: 16px; font-weight: bold; letter-spacing: 1px; padding: 12px 16px; background:#f2f4f7; display: inline-block; border-radius: 8px;">
        ${password.replace(/</g, '&lt;')}
      </div>
      <p>For security, consider changing this password regularly.</p>
    </div>
  `

  if (!transport) {
    console.log(`[mail] SMTP not configured. Admin password for ${to}: ${password}`)
    return { ok: true, dev: true }
  }

  await transport.sendMail({ from, to, subject, html })
  return { ok: true }
}
