/**
 * Simple rate limiter abstraction with optional Upstash Redis REST backend.
 * Fallback to in-memory when UPSTASH envs are not set.
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

type Backend = "redis" | "memory"
const backend: Backend = UPSTASH_URL && UPSTASH_TOKEN ? "redis" : "memory"

// In-memory buckets (per instance)
const buckets = new Map<string, number[]>()

export async function checkRateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000)
  if (backend === "redis") {
    try {
      // Token bucket via INCR + EXPIRE
      const url = `${UPSTASH_URL}/incr/${encodeURIComponent(key)}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
        cache: "no-store",
      })
      const data = await res.json().catch(() => ({} as any))
      const count = Number(data?.result ?? 0)
      if (count === 1) {
        // set TTL on first increment
        const ttlUrl = `${UPSTASH_URL}/expire/${encodeURIComponent(key)}/${windowSec}`
        await fetch(ttlUrl, { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }, cache: "no-store" })
      }
      return count <= max
    } catch {
      // fall through to memory on error
    }
  }
  // Memory fallback
  const list = buckets.get(key) || []
  const fresh = list.filter((t) => now - t < windowSec)
  if (fresh.length >= max) {
    buckets.set(key, fresh)
    return false
  }
  fresh.push(now)
  buckets.set(key, fresh)
  return true
}
