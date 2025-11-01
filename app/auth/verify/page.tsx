"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function VerifyPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState(sp?.get("email") || "")
  const rawNext = sp?.get("next") || ""
  const nextPath = rawNext.startsWith("/") ? rawNext : "/"
  const [code, setCode] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Verification failed")
  setMessage("Email verified! Redirecting...")
  setTimeout(() => router.push(nextPath), 800)
    } catch (e: any) {
      setError(e?.message || "Verification failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onResend = async () => {
    setError("")
    setMessage("")
    setIsResending(true)
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Resend failed")
      setMessage("Verification code sent to your email")
    } catch (e: any) {
      setError(e?.message || "Resend failed")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md rounded-2xl shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verify your email</CardTitle>
          <CardDescription>We sent a 6-digit code to your email. Enter it below to complete sign up.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input id="code" inputMode="numeric" pattern="^[0-9]{6}$" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} required />
              <p className="text-xs text-muted-foreground">Code expires in 15 minutes.</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-between text-sm">
            <button onClick={onResend} disabled={isResending} className="text-primary hover:underline">
              {isResending ? "Sending..." : "Resend code"}
            </button>
            <Link href="/auth" className="text-muted-foreground hover:underline">Back to sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
