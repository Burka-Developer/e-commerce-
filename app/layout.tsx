import type React from "react"
import type { Metadata } from "next"
import { Bricolage_Grotesque } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/components/cart-provider"
import { AuthProvider } from "@/components/auth-provider"
import { WishlistProvider } from "@/components/wishlist-provider"
import { ReviewsProvider } from "@/components/reviews-provider"
import { CouponProvider } from "@/components/coupon-provider"
import { OrderProvider } from "@/components/order-provider"
import { LanguageProvider } from "@/components/language-provider"
import AIChatWidget from "@/components/ai-chat-widget"

// Modern, clean font: Bricolage Grotesque
const bricolage = Bricolage_Grotesque({ 
  subsets: ["latin"], 
  variable: "--font-bricolage",
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "108 — Luxury Fashion & Accessories",
  description: "108 is a modern luxury destination for Abayas, Wedding Clothes, Underwear, Gym Wear, and Accessories.",
  keywords: "108, luxury, fashion, abayas, wedding, underwear, gym wear, accessories, ecommerce",
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${bricolage.variable} antialiased`}>
      <body>
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            <AuthProvider>
              <ReviewsProvider>
                <WishlistProvider>
                  <CouponProvider>
                    <OrderProvider>
                      <CartProvider>
                        {children}
                        <Toaster />
                        <AIChatWidget />
                      </CartProvider>
                    </OrderProvider>
                  </CouponProvider>
                </WishlistProvider>
              </ReviewsProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
