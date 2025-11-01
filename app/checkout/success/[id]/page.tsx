"use client"

import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOrders } from "@/components/order-provider"
import Image from "next/image"
import Link from "next/link"

export default function OrderSuccessPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { getOrder } = useOrders()

  const orderId = decodeURIComponent(params?.id || "")
  const order = getOrder(orderId)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Thank you for your purchase!</h1>
          <p className="text-muted-foreground">
            Your order has been received and is being processed. We appreciate you choosing Store 108.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Order Confirmation</CardTitle>
            <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {order ? (
              <>
                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 shrink-0">
                        <Image
                          src={item.image || "/products/item1.jpg"}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="rounded object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-medium">SAR {(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="flex justify-between border-t pt-4 font-semibold">
                  <span>Total</span>
                  <span className="text-primary">SAR {order.total.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Shipping to</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      <br />
                      {order.shippingAddress.address}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      <br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Payment</h3>
                    <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">We couldn't find this order in your recent session. You can view all your orders from your account.</p>
            )}

            <div className="p-3 rounded border bg-muted/40 text-sm">
              We've sent your order details to our team. You'll receive updates by email, and our admin is notified via SMS.
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/orders">View my orders</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products">Continue shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
