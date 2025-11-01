"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface MobileMenuContextType {
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, toggleMobileMenu, closeMobileMenu }}>
      {children}
    </MobileMenuContext.Provider>
  )
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext)
  if (!context) {
    throw new Error("useMobileMenu must be used within MobileMenuProvider")
  }
  return context
}
