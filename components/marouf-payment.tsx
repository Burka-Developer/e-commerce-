"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Lock, CheckCircle, AlertCircle, Loader } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MaroufPaymentProps {
  amount: number
  currency: string
  orderId: string
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function MaroufPayment({ amount, currency, orderId, customerInfo, onSuccess, onError }: MaroufPaymentProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [selectedMethod, setSelectedMethod] = useState<"card" | "apple-pay" | "tabby" | "tamara" | null>(null)

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", description: "Visa, Mastercard, Mada", badge: "Most Popular" },
    { id: "apple-pay", name: "Apple Pay", description: "Fast & Secure", badge: "Quick" },
    { id: "tabby", name: "Tabby", description: "Pay in 4 installments", badge: "0% Interest" },
    { id: "tamara", name: "Tamara", description: "Flexible payment plans", badge: "Interest-Free" },
  ] as const

  const handleInitiatePayment = async () => {
    if (!selectedMethod) {
      toast({ title: "Please select a payment method", variant: "destructive" })
      return
    }
    setIsProcessing(true)
    setPaymentStatus("processing")
    try {
      const paymentData = {
        amount,
        currency,
        orderId,
        paymentMethod: selectedMethod,
        customer: customerInfo,
        timestamp: new Date().toISOString(),
      }
      // Simulate gateway call
      await new Promise((r) => setTimeout(r, 1500))
      setPaymentStatus("success")
      toast({ title: "Payment Initiated", description: "Redirecting to Marouf secure gateway..." })
      onSuccess?.(paymentData)
    } catch (error: any) {
      setPaymentStatus("error")
      const message = error?.message || "Payment failed"
      toast({ title: "Payment Error", description: message, variant: "destructive" })
      onError?.({ message })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 mt-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex gap-3">
        <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm mb-1">Secure Payment with Marouf</p>
          <p className="text-xs text-muted-foreground">Your payment information is encrypted and secured with 256-bit SSL.</p>
        </div>
      </motion.div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Select Payment Method</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentMethods.map((m) => (
            <motion.button
              key={m.id}
              onClick={() => setSelectedMethod(m.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                selectedMethod === m.id ? "border-primary bg-primary/10 shadow-lg" : "border-border hover:border-primary/50 hover:bg-accent/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                </div>
                {selectedMethod === m.id && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />}
              </div>
              <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                {m.badge}
              </Badge>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="rounded-lg p-4 bg-accent/30 border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            {currency} {amount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Tax (15%)</span>
          <span className="font-medium">
            {currency} {(amount * 0.15).toFixed(2)}
          </span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex justify-between text-base font-semibold">
          <span>Total Amount</span>
          <span className="text-primary">
            {currency} {(amount * 1.15).toFixed(2)}
          </span>
        </div>
      </div>

      {paymentStatus === "success" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-green-800">Payment initiated successfully</p>
            <p className="text-xs text-green-700 mt-1">You will be redirected to Marouf secure gateway.</p>
          </div>
        </motion.div>
      )}

      {paymentStatus === "error" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-800">Payment failed</p>
            <p className="text-xs text-red-700 mt-1">Please try again or contact support.</p>
          </div>
        </motion.div>
      )}

      <motion.button
        onClick={handleInitiatePayment}
        disabled={isProcessing || !selectedMethod}
        whileHover={!isProcessing && selectedMethod ? { scale: 1.02 } : {}}
        whileTap={!isProcessing && selectedMethod ? { scale: 0.98 } : {}}
        className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
          isProcessing || !selectedMethod
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg"
        }`}
      >
        {isProcessing ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>Proceed to Secure Payment</span>
          </>
        )}
      </motion.button>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>By clicking "Proceed to Secure Payment", you agree to our Terms & Conditions</p>
        <p>Your transaction is encrypted and secure with Marouf platform</p>
      </div>
    </div>
  )
}
