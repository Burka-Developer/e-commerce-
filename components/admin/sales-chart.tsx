"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import useSWR from "swr"

type SalesPoint = { day: string; orders: number; gross: number }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function SalesChart() {
  const { data, error, isLoading } = useSWR<SalesPoint[]>("/api/admin/stats/sales", fetcher)

  const chartData =
    data?.map((d) => ({
      name: d.day, // you could format to month/day if desired
      sales: Number(d.gross || 0),
    })) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        {isLoading && <div className="text-sm text-muted-foreground mt-2">Loading sales...</div>}
        {error && <div className="text-sm text-destructive mt-2">Failed to load sales.</div>}
        {!isLoading && !error && chartData.length === 0 && (
          <div className="text-sm text-muted-foreground mt-2">No sales data yet.</div>
        )}
      </CardContent>
    </Card>
  )
}
