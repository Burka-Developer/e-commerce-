"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import faq from "@/content/faq.json"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

// Very lightweight, local FAQ chatbot.
// No external AI providers; answers are matched from content/faq.json and simple intent rules.
export function AIChatWidget({ className }: { className?: string }) {
  const { t } = useLanguage()
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "assistant",
      content: t("chatInitial"),
    },
  ])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Auto-scroll to bottom on new message
    scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" })
  }, [messages, open])

  // Build a flat list of Q&A from FAQ
  const qa: Array<{ q: string; a: string; category: string }> = React.useMemo(() => {
    try {
      const all: Array<{ q: string; a: string; category: string }> = []
      for (const cat of (faq as any).categories as Array<{ category: string; items: { q: string; a: string }[] }>) {
        for (const item of cat.items) all.push({ q: item.q, a: item.a, category: cat.category })
      }
      return all
    } catch {
      return []
    }
  }, [])

  function normalize(s: string) {
    return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim()
  }

  function score(query: string, item: { q: string; a: string }) {
    const qn = normalize(query)
    const inQ = normalize(item.q)
    const inA = normalize(item.a)
    if (!qn) return 0
    let s = 0
    if (inQ.includes(qn)) s += 4
    if (qn.includes(inQ)) s += 3
    const tokens = Array.from(new Set(qn.split(" ").filter((t) => t.length >= 3)))
    for (const tkn of tokens) {
      if (inQ.includes(tkn)) s += 2
      else if (inA.includes(tkn)) s += 1
    }
    return s
  }

  function intentReply(query: string): string | null {
    const q = normalize(query)
    // Quick intents to site pages
    if (/track|where.*order|tracking/.test(q)) return `You can track your order here: /track`
    if (/return|refund/.test(q)) return `Our return policy: 30-day returns in original condition. See /faq or contact /support.`
    if (/coupon|promo|discount/.test(q)) return `Apply your coupon at checkout on the right side. For help, visit /faq.`
    if (/payment|pay|card|failed/.test(q)) return `If a payment fails, retry with another method or contact /contact.`
    if (/shipping|deliver/.test(q)) return `Shipping: Standard 3-5 days, Express 1-2 in major cities. Details at /faq.`
    return null
  }

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setError(null)
    setLoading(true)
    setMessages((prev) => [...prev, { role: "user", content }])
    setInput("")
    try {
      // Simulate a short thinking delay for UX
      await new Promise((r) => setTimeout(r, 250))
      const quick = intentReply(content)
      if (quick) {
        setMessages((prev) => [...prev, { role: "assistant", content: quick }])
        return
      }
      let best = { idx: -1, score: -1 }
      for (let i = 0; i < qa.length; i++) {
        const s = score(content, qa[i])
        if (s > best.score) best = { idx: i, score: s }
      }
      if (best.idx >= 0 && best.score >= 3) {
        const item = qa[best.idx]
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `${item.a}\n\nCategory: ${item.category} • More: /faq` },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I couldn't find an exact match. Please check /faq, or tell me more details. You can also reach us at /contact.",
          },
        ])
      }
    } catch (e: any) {
      setError(e?.message || String(e))
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong locally. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    "Where is my order?",
    "My payment failed — what now?",
    "What's your return policy?",
    "How do I apply a coupon?",
  ]

  const overridePosition = className && /(static|relative|absolute|fixed)/.test(className)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className={cn(
            // Default floating position; allow overriding with className
            overridePosition ? "" : "fixed bottom-6 left-6 z-50 shadow-xl rounded-full px-4 h-12",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            className
          )}
          aria-label="Open help chat"
        >
          <MessageSquare className="mr-2 h-5 w-5" /> {t("chat")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>{t("chat")}</DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Button key={s} variant="secondary" size="sm" onClick={() => sendMessage(s)}>
                {s}
              </Button>
            ))}
          </div>
          <div className="border rounded-xl">
            <ScrollArea ref={scrollRef} className="h-72 p-3">
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}> 
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                        m.role === "user"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center text-sm text-gray-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("thinking")}</div>
                )}
                {error && <div className="text-sm text-red-600">{error}</div>}
              </div>
            </ScrollArea>
            <div className="border-t p-2 flex gap-2 items-center">
              <Input
                placeholder="Type your question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              <Button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">This assistant uses our help content only and doesn’t send data to external AI. For account-specific help, visit <a className="underline" href="/contact">/contact</a>.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AIChatWidget
