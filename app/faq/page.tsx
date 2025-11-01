import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { FAQClient } from "@/components/faq/faq-client"

export const metadata = {
  title: "Frequently Asked Questions | 108",
  description: "Find answers to common questions about our products, orders, and services",
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <FAQClient />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
