"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { CreditCard, Shield, Smartphone, Apple, Building } from "lucide-react"

interface PayTabsIntegrationProps {
  amount: number
  currency?: string
  orderId: string
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  onSuccess: (paymentData: any) => void
  onError: (error: any) => void
}

export function PayTabsIntegration({ 
  amount, 
  currency = "SAR", 
  orderId, 
  customerInfo, 
  onSuccess, 
  onError 
}: PayTabsIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>("")

  // PayTabs configuration (client should NOT use secret keys)
  const paytabsConfig = {
    profile_id: process.env.NEXT_PUBLIC_PAYTABS_PROFILE_ID || "your_profile_id",
  }

  const paymentMethods = [
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: Building,
      description: "Pay directly via bank account",
      popular: false
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, Mada",
      popular: true
    },
    {
      id: "apple_pay",
      name: "Apple Pay",
      icon: Apple,
      description: "Pay with Apple Pay",
      popular: true
    },
    {
      id: "mada",
      name: "Mada",
      icon: CreditCard,
      description: "Saudi Mada cards",
      popular: false
    },
    {
      id: "tabby",
      name: "Tabby",
      icon: Smartphone,
      description: "Buy now, pay later",
      popular: false
    },
    {
      id: "tamara",
      name: "Tamara",
      icon: Smartphone,
      description: "Buy now, pay later",
      popular: false
    }
  ]

  const handlePayment = async (method: string) => {
    setIsLoading(true)
    setSelectedMethod(method)

    try {
      // Prepare payment data
      const paymentData = {
        profile_id: paytabsConfig.profile_id,
        tran_type: "sale",
        tran_class: "ecom",
        cart_id: orderId,
        cart_currency: currency,
        cart_amount: amount,
        cart_description: `Order #${orderId}`,
        customer_details: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          street1: "Riyadh",
          city: "Riyadh",
          state: "Riyadh",
          country: "SA",
          zip: "12345"
        },
        shipping_details: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          street1: "Riyadh",
          city: "Riyadh",
          state: "Riyadh",
          country: "SA",
          zip: "12345"
        },
        callback: `${window.location.origin}/checkout/success`,
        return: `${window.location.origin}/checkout/success`,
        hide_shipping: "yes",
        framed: "no"
      }

      // For Apple Pay, Mada, Tabby, Tamara - use specific integration
      if (method === "bank_transfer") {
        await handleBankTransfer(paymentData)
      } else if (method === "apple_pay") {
        // Apple Pay integration
        await handleApplePay(paymentData)
      } else if (method === "mada") {
        // Mada integration
        await handleMadaPayment(paymentData)
      } else if (method === "tabby") {
        // Tabby integration
        await handleTabbyPayment(paymentData)
      } else if (method === "tamara") {
        // Tamara integration
        await handleTamaraPayment(paymentData)
      } else {
        // Standard card payment
        await handleCardPayment(paymentData)
      }

    } catch (error) {
      console.error("Payment error:", error)
      onError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardPayment = async (paymentData: any) => {
    // Initialize payment through our secure server route
    const response = await fetch("/api/paytabs/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData)
    })

    const result = await response.json()
    if (result.redirect_url) {
      window.location.href = result.redirect_url
    } else {
      throw new Error(result.message || "Payment initialization failed")
    }
  }

  const handleBankTransfer = async (paymentData: any) => {
    // For bank transfer, provide instructions and mark as pending
    onSuccess({
      status: "pending",
      method: "bank_transfer",
      amount,
      currency,
      orderId,
      bankDetails: {
        accountName: "108 Store Trading",
        iban: "SA03 8000 0000 6080 1016 7519",
        bankName: "Al Rajhi Bank",
        swiftCode: "RJHISARI"
      }
    })

    // Additionally notify the user
    alert(
      "Bank Transfer Selected\n\nPlease transfer " +
        amount +
        " " +
        currency +
        " to the following account within 24 hours:\n" +
        "Account Name: 108 Store Trading\n" +
        "IBAN: SA03 8000 0000 6080 1016 7519\n" +
        "Bank: Al Rajhi Bank"
    )
  }

  const handleApplePay = async (paymentData: any) => {
    // Apple Pay integration
  const apple = (window as any).ApplePaySession
  if (apple && typeof apple.canMakePayments === 'function' && apple.canMakePayments()) {
  const session = new apple(3, {
        countryCode: "SA",
        currencyCode: currency,
        supportedNetworks: ["visa", "masterCard", "mada"],
        merchantCapabilities: ["supports3DS"],
        total: {
          label: "108 Store",
          amount: amount.toString()
        }
      })

      session.onvalidatemerchant = async (event: any) => {
        try {
          const validationURL = event.validationURL
          // Validate with PayTabs
          const response = await fetch("/api/paytabs/validate-merchant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ validationURL, ...paymentData })
          })
          const merchantSession = await response.json()
          session.completeMerchantValidation(merchantSession)
        } catch (error) {
          session.abort()
          throw error
        }
      }

      session.onpaymentauthorized = async (event: any) => {
        try {
          // Process payment with PayTabs
          const response = await fetch("/api/paytabs/process-apple-pay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              payment: event.payment, 
              ...paymentData 
            })
          })
          const result = await response.json()
          
          if (result.success) {
            session.completePayment((apple as any).STATUS_SUCCESS)
            onSuccess(result)
          } else {
            session.completePayment((apple as any).STATUS_FAILURE)
            throw new Error(result.message)
          }
        } catch (error) {
            session.completePayment((apple as any).STATUS_FAILURE)
          throw error
        }
      }

      session.begin()
    } else {
      throw new Error("Apple Pay is not available on this device")
    }
  }

  const handleMadaPayment = async (paymentData: any) => {
    // Mada specific payment via our server route
    const madaData = {
      ...paymentData,
      payment_method: "mada"
    }
    const response = await fetch("/api/paytabs/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(madaData)
    })

    const result = await response.json()
    if (result.redirect_url) {
      window.location.href = result.redirect_url
    } else {
      throw new Error(result.message || "Mada payment initialization failed")
    }
  }

  const handleTabbyPayment = async (paymentData: any) => {
    // Tabby integration
    const tabbyData = {
      ...paymentData,
      payment_method: "tabby"
    }
    
    const response = await fetch("/api/paytabs/tabby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tabbyData)
    })

    const result = await response.json()
    
    if (result.checkout_url) {
      window.location.href = result.checkout_url
    } else {
      throw new Error(result.message || "Tabby payment initialization failed")
    }
  }

  const handleTamaraPayment = async (paymentData: any) => {
    // Tamara integration
    const tamaraData = {
      ...paymentData,
      payment_method: "tamara"
    }
    
    const response = await fetch("/api/paytabs/tamara", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tamaraData)
    })

    const result = await response.json()
    
    if (result.checkout_url) {
      window.location.href = result.checkout_url
    } else {
      throw new Error(result.message || "Tamara payment initialization failed")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="border-2 border-primary/20 rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display text-primary">Secure Payment</CardTitle>
          <p className="text-muted-foreground">Choose your preferred payment method</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Summary */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Order Total</span>
              <span className="text-xl font-bold text-primary">{amount} {currency}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Order ID</span>
              <span>#{orderId}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid gap-3">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    className={`w-full h-auto p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedMethod === method.id 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => handlePayment(method.id)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{method.name}</span>
                            {method.popular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      {isLoading && selectedMethod === method.id && (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                      )}
                    </div>
                  </Button>
                </motion.div>
              )
            })}
          </div>

          {/* Security Badge */}
          <motion.div 
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Shield className="h-4 w-4" />
            <span>Secured by PayTabs • SAMA Licensed</span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

