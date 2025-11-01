"use client"

import Link from "next/link"
import { FaYoutube, FaFacebook, FaInstagram, FaSnapchat, FaTiktok } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import { useLanguage } from "@/components/language-provider"

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-accent text-lg md:text-xl font-bold tracking-wide">108 Store</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-light">
              {t("aboutIntro")}
            </p>
            
            {/* Social Media Links */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground tracking-wide">{t("followUs")}</h4>
              <div className="flex flex-row gap-3 flex-nowrap justify-center sm:justify-start">
                <Link 
                  href="https://youtube.com/store-108" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-[#FF0000] hover:bg-[#CC0000] transition-all duration-300 focus-ring" 
                  aria-label="YouTube"
                >
                  <FaYoutube className="h-5 w-5 text-white" />
                </Link>
                
                <Link 
                  href="https://www.facebook.com/share/1HB9h7YE2w/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-[#1877F2] hover:bg-[#1465D8] transition-all duration-300 focus-ring" 
                  aria-label="Facebook"
                >
                  <FaFacebook className="h-5 w-5 text-white" />
                </Link>
                
                <Link 
                  href="https://www.instagram.com/108.cl?igsh=aXM1b2NiNGE0bmhi" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 transition-all duration-300 focus-ring" 
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-5 w-5 text-white" />
                </Link>
                
                <Link 
                  href="https://www.snapchat.com/add/est.108?share_id=MfPCf_2KRcQ&locale=ar-SA" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-[#FFFC00] hover:bg-[#E6E300] transition-all duration-300 focus-ring" 
                  aria-label="Snapchat"
                >
                  <FaSnapchat className="h-5 w-5 text-black" />
                </Link>
                
                <Link 
                  href="https://x.com/S7Yol?s=09" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-black hover:bg-gray-800 transition-all duration-300 focus-ring" 
                  aria-label="X (Twitter)"
                >
                  <FaXTwitter className="h-5 w-5 text-white" />
                </Link>
                
                <Link 
                  href="https://tiktok.com/@108.cl" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-black hover:bg-gray-800 transition-all duration-300 focus-ring" 
                  aria-label="TikTok"
                >
                  <FaTiktok className="h-5 w-5 text-white" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-accent text-base font-semibold tracking-wide">{t("quickLinks")}</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("aboutUs")}
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("contact")}
              </Link>
              <Link href="/faq" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("faq")}
              </Link>
              <Link href="/shipping" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("shippingInfo")}
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-accent text-base font-semibold tracking-wide">{t("categories")}</h3>
            <div className="space-y-2">
              <Link href="/collections/underwear" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("underwear")}
              </Link>
              <Link href="/collections/wedding" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("wedding")}
              </Link>
              <Link href="/collections/abayas" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("abayas")}
              </Link>
              <Link href="/collections/gym" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("gym")}
              </Link>
              <Link href="/collections/accessories" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("accessories")}
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-accent text-base font-semibold tracking-wide">{t("customerService")}</h3>
            <div className="space-y-2">
              <Link href="/returns" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("returnsExchanges")}
              </Link>
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("privacyPolicy")}
              </Link>
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("termsOfService")}
              </Link>
              <Link href="/support" className="block text-sm text-muted-foreground hover:text-primary hover-underline focus-ring rounded font-medium">
                {t("supportCenter")}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p className="text-sm font-medium tracking-wide">&copy; 2025 108 Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
