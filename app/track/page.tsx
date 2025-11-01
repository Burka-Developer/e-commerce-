"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function TrackHome() {
  const [code, setCode] = useState("")
  const router = useRouter()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    router.push(`/track/${encodeURIComponent(code.trim())}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Track your order</h1>
        <p className="text-muted-foreground mb-6">Enter your tracking or order ID to view status.</p>
        <form className="max-w-xl flex gap-3" onSubmit={onSubmit}>
          <Input placeholder="#3210 or tracking code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit">Track</Button>
        </form>
      </main>
      <Footer />
    </div>
  )
}



