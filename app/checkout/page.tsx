"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useCoupon } from "@/components/coupon-provider"
import { useOrders } from "@/components/order-provider"
import { PayTabsIntegration } from "@/components/paytabs-integration"
import { PaymentMethods } from "@/components/payment-methods"
import { MaroufPayment } from "@/components/marouf-payment"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Smartphone, Building, Banknote, Lock, MapPin, Tag, X, Percent, Shield } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const { applyCoupon, removeCoupon, calculateDiscount, appliedCoupon } = useCoupon()
  const { addOrder } = useOrders()
  const { toast } = useToast()
  const router = useRouter()

  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  // Shipping Information
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "")
  const [lastName, setLastName] = useState(user?.name?.split(" ")[1] || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [country, setCountry] = useState("Saudi Arabia")

  // Payment Information
  const [paymentMethod, setPaymentMethod] = useState<"paytabs" | "marouf" | "card">("paytabs")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState("")

  const [orderNotes, setOrderNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const shippingCost: number = 0 // Free shipping for Saudi Arabia
  const tax = total * 0.15 // 15% VAT for Saudi Arabia
  const discount = calculateDiscount(total)
  const finalTotal = total + shippingCost + tax - discount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Please enter a coupon code",
        variant: "destructive",
      })
      return
    }

    setIsApplyingCoupon(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = applyCoupon(couponCode)

    if (result.success) {
      toast({
        title: "Coupon applied!",
        description: result.message,
      })
      setCouponCode("")
    } else {
      toast({
        title: "Invalid coupon",
        description: result.message,
        variant: "destructive",
      })
    }

    setIsApplyingCoupon(false)
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your order.",
    })
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Create order (local state)
    const orderId = addOrder({
      status: "processing",
      total: finalTotal,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      shippingAddress: {
        firstName,
        lastName,
        address,
        city,
        state,
        zipCode,
        country,
      },
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon?.code,
      discount,
    })

    // Fire server-side email notification
    try {
      const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          shippingAddress: { firstName, lastName, address, city, state, zipCode, country },
          paymentMethod,
          notes: orderNotes || undefined,
          couponCode: appliedCoupon?.code || undefined,
          totals: {
            subtotal,
            tax,
            shipping: shippingCost,
            discount,
            total: finalTotal,
            currency: "SAR",
          },
        }),
      })
    } catch (err) {
      // Non-fatal: order exists locally; just inform user
      console.error("Order email failed:", err)
    }

    toast({
      title: "Order created successfully!",
      description: `Order ${orderId} has been created.`,
    })

    // Clear cart and coupon, then go to confirmation page
    clearCart()
    if (appliedCoupon) removeCoupon()
    setIsProcessing(false)
    router.push(`/checkout/success/${encodeURIComponent(orderId)}`)
  }

  const handlePayTabsSuccess = (paymentData: any) => {
    toast({
      title: "Payment successful!",
      description: "Your order has been confirmed and payment processed.",
    })
    
    clearCart()
    if (appliedCoupon) {
      removeCoupon()
    }
    router.push("/orders")
  }

  const handlePayTabsError = (error: any) => {
    toast({
      title: "Payment failed",
      description: error.message || "There was an error processing your payment. Please try again.",
      variant: "destructive",
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items to your cart before checking out.</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 font-display text-primary">Checkout</h1>
          <p className="text-muted-foreground text-lg">Complete your purchase securely</p>
        </motion.div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-2 border-primary/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <MapPin className="h-6 w-6 text-primary" />
                      <span>Shipping Information</span>
                    </CardTitle>
                  </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House number and street name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Select value={state} onValueChange={setState} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="riyadh">Riyadh</SelectItem>
                          <SelectItem value="makkah">Makkah</SelectItem>
                          <SelectItem value="eastern">Eastern Province</SelectItem>
                          <SelectItem value="asir">Asir</SelectItem>
                          <SelectItem value="jazan">Jazan</SelectItem>
                          <SelectItem value="medina">Medina</SelectItem>
                          <SelectItem value="qassim">Qassim</SelectItem>
                          <SelectItem value="hail">Hail</SelectItem>
                          <SelectItem value="tabuk">Tabuk</SelectItem>
                          <SelectItem value="northern">Northern Borders</SelectItem>
                          <SelectItem value="jazan">Jazan</SelectItem>
                          <SelectItem value="najran">Najran</SelectItem>
                          <SelectItem value="al-baha">Al Baha</SelectItem>
                          <SelectItem value="al-jouf">Al Jouf</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                        <SelectItem value="UAE">United Arab Emirates</SelectItem>
                        <SelectItem value="Kuwait">Kuwait</SelectItem>
                        <SelectItem value="Qatar">Qatar</SelectItem>
                        <SelectItem value="Bahrain">Bahrain</SelectItem>
                        <SelectItem value="Oman">Oman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-2 border-primary/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <Lock className="h-6 w-6 text-primary" />
                      <span>Payment Method</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PaymentMethods 
                      selectedMethod={paymentMethod}
                      onMethodChange={setPaymentMethod}
                    />

                    {/* Marouf Integration */}
                    {paymentMethod === "marouf" && (
                      <MaroufPayment
                        amount={finalTotal}
                        currency="SAR"
                        orderId={`ORD-${Date.now()}`}
                        customerInfo={{
                          name: `${firstName} ${lastName}`,
                          email: email,
                          phone: phone,
                        }}
                        onSuccess={handlePayTabsSuccess}
                        onError={handlePayTabsError}
                      />
                    )}

                    {/* Card Payment Details */}
                    {paymentMethod === "card" && (
                      <div className="space-y-4 p-6 bg-muted/50 rounded-xl mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Cardholder Name *</Label>
                          <Input
                            id="cardName"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number *</Label>
                          <Input
                            id="cardNumber"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            required
                            className="rounded-lg"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date *</Label>
                            <Input
                              id="expiryDate"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(e.target.value)}
                              placeholder="MM/YY"
                              required
                              className="rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              placeholder="123"
                              required
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Order Notes */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-2 border-primary/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Order Notes (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Special instructions for your order..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                      className="rounded-xl"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="sticky top-4 border-2 border-primary/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 shrink-0">
                          <Image
                            src={item.image || "/products/item1.jpg"}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Coupon Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Coupon Code</span>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-accent/20 border-2 border-accent rounded-xl">
                        <div className="flex items-center space-x-2">
                          <Percent className="h-4 w-4 text-accent-foreground" />
                          <div>
                            <span className="font-medium text-accent-foreground">{appliedCoupon.code}</span>
                            <p className="text-xs text-muted-foreground">{appliedCoupon.description}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="hover:bg-accent/30"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1 rounded-xl"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon}
                          className="rounded-xl border-2 hover:bg-accent/10"
                        >
                          {isApplyingCoupon ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                    )}

                    {/* Demo Coupons */}
                    <div className="p-3 bg-primary/5 border-2 border-primary/20 rounded-xl">
                      <p className="text-xs font-medium text-foreground mb-2">Demo Coupons (Try these!):</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30">
                            WELCOME10
                          </Badge>
                          <span>10% off orders $50+</span>
                        </div>
                        <div className="flex justify-between">
                          <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30">
                            SAVE20
                          </Badge>
                          <span>$20 off orders $100+</span>
                        </div>
                        <div className="flex justify-between">
                          <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30">
                            BIGDEAL
                          </Badge>
                          <span>25% off orders $200+</span>
                        </div>
                        <div className="flex justify-between">
                          <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30">
                            FREESHIP
                          </Badge>
                          <span>Free shipping</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (15%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-accent-foreground font-medium">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <div className="text-right">
                        <span className="text-primary">${finalTotal.toFixed(2)}</span>
                        {discount > 0 && (
                          <div className="text-sm text-accent-foreground font-normal">You save ${discount.toFixed(2)}!</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      type="submit" 
                      className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" 
                      size="lg" 
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : `Place Order - ${finalTotal.toFixed(2)} SAR`}
                    </Button>
                  </motion.div>

                  <p className="text-xs text-muted-foreground text-center">
                    By placing your order, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
