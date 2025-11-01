"use client"

import React from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CreditCard, Building, Shield } from "lucide-react"

type PaymentMethod = "paytabs" | "marouf" | "card"

interface PaymentMethodsProps {
	selectedMethod: PaymentMethod
	onMethodChange: (value: PaymentMethod) => void
}

function PaymentMethodsComponent({ selectedMethod, onMethodChange }: PaymentMethodsProps) {
	return (
		<div className="space-y-4">
			<RadioGroup value={selectedMethod} onValueChange={(v) => onMethodChange(v as PaymentMethod)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				<Label
					htmlFor="paytabs"
					className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
						selectedMethod === "paytabs" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
					}`}
				>
					<RadioGroupItem value="paytabs" id="paytabs" className="sr-only" />
					<Shield className="h-5 w-5 text-primary" />
					<div>
						<div className="font-medium">PayTabs</div>
						<div className="text-xs text-muted-foreground">Secure payment gateway</div>
					</div>
				</Label>

				<Label
					htmlFor="marouf"
					className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
						selectedMethod === "marouf" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
					}`}
				>
					<RadioGroupItem value="marouf" id="marouf" className="sr-only" />
					<Building className="h-5 w-5 text-primary" />
					<div>
						<div className="font-medium">Marouf</div>
						<div className="text-xs text-muted-foreground">Saudi trusted payments</div>
					</div>
				</Label>

				<Label
					htmlFor="card"
					className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
						selectedMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
					}`}
				>
					<RadioGroupItem value="card" id="card" className="sr-only" />
					<CreditCard className="h-5 w-5 text-primary" />
					<div>
						<div className="font-medium">Credit/Debit Card</div>
						<div className="text-xs text-muted-foreground">Visa, MasterCard, etc.</div>
					</div>
				</Label>
			</RadioGroup>
		</div>
	)
}

export default PaymentMethodsComponent
export const PaymentMethods = PaymentMethodsComponent
