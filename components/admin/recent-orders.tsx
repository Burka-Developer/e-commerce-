"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type RecentOrder = {
  orderId: string
  customerName: string
  customerEmail: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800"
    case "processing":
      return "bg-blue-100 text-blue-800"
    case "shipped":
      return "bg-purple-100 text-purple-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function formatCurrencySar(amount: number) {
  try {
    return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR" }).format(amount)
  } catch {
    return `${amount.toFixed(2)} SAR`
  }
}

export function RecentOrders() {
  const { data, error, isLoading } = useSWR<RecentOrder[]>("/api/admin/orders/recent", fetcher)
  const orders = useMemo(() => data || [], [data])
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {error && <div className="text-sm text-destructive">Failed to load recent orders</div>}
        {!isLoading && !error && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{order.orderId}</span>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    <Badge variant="outline">{order.paymentStatus}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.customerName} • {order.customerEmail}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-medium">{formatCurrencySar(order.total)}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <div className="text-sm text-muted-foreground">No recent orders</div>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
