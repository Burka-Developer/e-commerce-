import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProducts } from "@/components/featured-products"
import { Categories } from "@/components/categories"
import { Footer } from "@/components/footer"
import { CouponBanner } from "@/components/coupon-banner"
import { AboutSection } from "@/components/about-section"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <div className="container mx-auto px-4">
          <CouponBanner />
        </div>
        <Categories />
        <AboutSection />
        <FeaturedProducts />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
