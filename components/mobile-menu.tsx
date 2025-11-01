"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import { X, HelpCircle, MessageCircle, LifeBuoy, Mail, Truck } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const menuItemsRef = useRef<HTMLDivElement[]>([])
  const menuTimeline = useRef<any>(null)
  const { t } = useLanguage()

  const mobileMenuLinks = [
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/faq#qna", label: "Q&As", icon: MessageCircle },
    { href: "/support", label: "Support", icon: LifeBuoy },
    { href: "/contact", label: "Contact", icon: Mail },
    { href: "/track", label: "Track Order", icon: Truck },
  ]

  // Initialize GSAP timeline
  useEffect(() => {
    menuTimeline.current = gsap
      .timeline({ paused: true })
      .from(
        menuItemsRef.current,
        { y: 24, opacity: 0, stagger: 0.08, ease: "power3.out", duration: 0.4 },
        0.1
      )

    return () => {
      menuTimeline.current?.kill()
      menuTimeline.current = null
    }
  }, [])

  // Play/reverse timeline based on menu state
  useEffect(() => {
    if (!menuTimeline.current) return

    if (isOpen) {
      menuTimeline.current.play()
      document.body.style.overflow = "hidden"
    } else {
      menuTimeline.current.reverse()
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Keep refs array clean
  menuItemsRef.current.length = 0

  const handleClose = () => {
    onClose()
  }

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Blur effect */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md"
            onClick={handleClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Menu Slide - From Right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-slate-950 shadow-2xl px-6 py-8 flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-semibold text-sm">
                  108
                </div>
                <span className="font-display text-lg font-bold text-foreground">108 Store</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="space-y-1 flex-1">
              {mobileMenuLinks.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.href}
                    ref={(el) => {
                      if (el) menuItemsRef.current[index] = el
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.08 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200"
                      onClick={handleLinkClick}
                    >
                      <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-base font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Footer */}
            <motion.div
              className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium uppercase tracking-wide">
                🔒 Secure Payment
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">Tabby</span>
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">Tamara</span>
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">Apple Pay</span>
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">Bank</span>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
