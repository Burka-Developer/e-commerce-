"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import useSWR from "swr"

type SummaryResponse = {
  totalRevenue: number
  orderCount: number
  customerCount: number
  productCount: number
  paidOrderCount: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

export function DashboardStats() {
  const { data, error, isLoading } = useSWR<SummaryResponse>("/api/admin/stats/summary", fetcher, {
    revalidateOnFocus: false,
  })

  const stats = [
    {
      title: "Total Revenue",
      value: data ? formatCurrency(data.totalRevenue) : "--",
      sublabel: data ? `${data.paidOrderCount} paid orders` : null,
      icon: DollarSign,
    },
    {
      title: "Orders",
      value: data ? data.orderCount.toString() : "--",
      sublabel: data ? `${data.paidOrderCount} paid` : null,
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      value: data ? data.customerCount.toString() : "--",
      icon: Users,
    },
    {
      title: "Products",
      value: data ? data.productCount.toString() : "--",
      icon: Package,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <span className="animate-pulse text-muted-foreground">Loading…</span> : stat.value}
              </div>
              {error ? (
                <p className="text-xs text-destructive mt-1">Failed to load</p>
              ) : stat.sublabel ? (
                <p className="text-xs text-muted-foreground mt-1">{stat.sublabel}</p>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
