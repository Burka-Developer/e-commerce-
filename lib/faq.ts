import faq from "@/content/faq.json"

export function getFaqContext(maxChars = 1500): string {
  try {
    const parts: string[] = []
    // Build a concise bullet format
    for (const cat of (faq as any).categories as Array<{ category: string; items: { q: string; a: string }[] }>) {
      parts.push(`Category: ${cat.category}`)
      for (const it of cat.items.slice(0, 5)) {
        parts.push(`- ${it.q}: ${it.a}`)
      }
    }
    let ctx = parts.join("\n")
    if (ctx.length > maxChars) ctx = ctx.slice(0, maxChars) + "…"
    return ctx
  } catch {
    return ""
  }
}
