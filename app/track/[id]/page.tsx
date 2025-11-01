"use client"

import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useOrders } from "@/components/order-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TrackDetail() {
  const params = useParams()
  const id = String(params?.id || "")
  const { getOrder, state } = useOrders()

  // Try both order id and tracking code
  const order = getOrder(id) || state.orders.find((o) => o.tracking === id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        {!order ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-2">No order found</h1>
            <p className="text-muted-foreground">We couldn't find an order or tracking code matching "{id}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order {order.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge>{order.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Tracking</span>
                    <span className="text-sm">{order.tracking || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Estimated delivery</span>
                    <span className="text-sm">{order.estimatedDelivery || "—"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between">
                      <div className="text-sm">{it.name} × {it.quantity}</div>
                      <div className="text-sm">${(it.price * it.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                    <div>{order.shippingAddress.address}</div>
                    <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                    <div>{order.shippingAddress.country}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Method</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}



