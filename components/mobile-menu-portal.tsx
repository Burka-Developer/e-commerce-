"use client"

import { MobileMenu } from "@/components/mobile-menu"
import { useMobileMenu } from "@/components/mobile-menu-context"

export function MobileMenuPortal() {
  const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu()
  return <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
}
