export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPost<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPatch<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "DELETE" })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
