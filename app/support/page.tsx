import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { ContactSupportClient } from "@/components/support/contact-support-client"

export const metadata = {
  title: "Customer Support | 108",
  description: "Get help and support from our dedicated customer service team available 24/7",
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <ContactSupportClient />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
