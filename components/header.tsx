"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { User, Menu, Heart, Sun, Moon, Globe, X, HelpCircle, MessageCircle, LifeBuoy, Mail, Truck, Search, ShoppingBag, Package, LogOut, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { FaYoutube, FaFacebook, FaInstagram, FaSnapchat, FaTiktok } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/auth-provider"
import { CartSidebar } from "@/components/cart-sidebar"
import { useWishlist } from "@/components/wishlist-provider"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/language-provider"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { count: wishlistCount } = useWishlist()
  const { t, lang, setLang } = useLanguage()
  const router = useRouter()

  const mobileMenuLinks = [
    { href: "/products", label: t("allProducts"), icon: ShoppingBag },
    { href: "/faq", label: t("faq"), icon: HelpCircle },
    { href: "/faq#qna", label: t("qnas"), icon: MessageCircle },
    { href: "/support", label: t("support"), icon: LifeBuoy },
    { href: "/contact", label: t("contact"), icon: Mail },
    { href: "/track", label: t("trackOrder"), icon: Truck },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false)
      }
    }
    if (isSearchOpen) {
      window.addEventListener("keydown", handleEscape)
    }
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isSearchOpen])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  const handleLogout = () => {
    logout()
    closeMobileMenu()
  }

  return (
    <>
      {/* Backdrop - Blur effect for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md"
            onClick={closeMobileMenu}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu - Slides from right */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-slate-950 shadow-2xl px-6 py-8 flex flex-col overflow-y-auto"
          >
            {/* Close button */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="font-accent text-xl font-bold text-foreground">108 Store</span>
              </div>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-2 text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Profile Section - Mobile */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-primary/5 rounded-xl border-2 border-primary/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-sm font-medium transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t("profile")}</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-sm font-medium transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    <span>{t("orders")}</span>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Login Button - Mobile (if not logged in) */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Link href="/auth" onClick={closeMobileMenu}>
                  <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" size="lg">
                    <User className="h-4 w-4 mr-2" />
                    {t("loginSignup")}
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Menu Items */}
            <nav className="space-y-1 flex-1">
              {mobileMenuLinks.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.08 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200"
                      onClick={closeMobileMenu}
                    >
                      <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-base font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
              {/* Shop by Category (mobile) */}
              <div className="mt-6">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium uppercase tracking-wide mb-3">
                  {t("shopByCategory")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { href: "/collections/underwear", label: t("underwear") },
                    { href: "/collections/abayas", label: t("abayas") },
                    { href: "/collections/accessories", label: t("accessories") },
                    { href: "/collections/gym", label: t("gym") },
                    { href: "/collections/wedding", label: t("wedding") },
                  ].map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={closeMobileMenu}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Logout Button - Mobile */}
            {user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("logout")}
                </Button>
              </motion.div>
            )}

            {/* Footer */}
            <motion.div
              className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Language Switcher - Mobile */}
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium uppercase tracking-wide mb-3">
                  {t("language")}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={lang === "ar" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => { setLang("ar"); closeMobileMenu(); }}
                  >
                    العربية
                  </Button>
                  <Button
                    variant={lang === "en" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => { setLang("en"); closeMobileMenu(); }}
                  >
                    English
                  </Button>
                </div>
              </div>
              {/* Social Media */}
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium uppercase tracking-wide mb-3">
                  🌐 {t("followUs")}
                </p>
                <div className="flex flex-row gap-3 flex-nowrap">
                  <Link
                    href="https://youtube.com/store-108"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-[#FF0000] hover:bg-[#CC0000] transition-all duration-300 focus-ring"
                    aria-label="YouTube"
                    onClick={closeMobileMenu}
                  >
                    <FaYoutube className="h-5 w-5 text-white" />
                  </Link>
                  
                  <Link
                    href="https://www.facebook.com/share/1HB9h7YE2w/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-[#1877F2] hover:bg-[#1465D8] transition-all duration-300 focus-ring"
                    aria-label="Facebook"
                    onClick={closeMobileMenu}
                  >
                    <FaFacebook className="h-5 w-5 text-white" />
                  </Link>
                  
                  <Link
                    href="https://www.instagram.com/108.cl?igsh=aXM1b2NiNGE0bmhi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 transition-all duration-300 focus-ring"
                    aria-label="Instagram"
                    onClick={closeMobileMenu}
                  >
                    <FaInstagram className="h-5 w-5 text-white" />
                  </Link>
                  
                  <Link
                    href="https://www.snapchat.com/add/est.108?share_id=MfPCf_2KRcQ&locale=ar-SA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-[#FFFC00] hover:bg-[#E6E300] transition-all duration-300 focus-ring"
                    aria-label="Snapchat"
                    onClick={closeMobileMenu}
                  >
                    <FaSnapchat className="h-5 w-5 text-black" />
                  </Link>
                  
                  <Link
                    href="https://x.com/S7Yol?s=09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-black hover:bg-gray-800 transition-all duration-300 focus-ring"
                    aria-label="X (Twitter)"
                    onClick={closeMobileMenu}
                  >
                    <FaXTwitter className="h-5 w-5 text-white" />
                  </Link>
                  
                  <Link
                    href="https://tiktok.com/@108.cl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center justify-center w-10 h-10 aspect-square rounded-full bg-black hover:bg-gray-800 transition-all duration-300 focus-ring"
                    aria-label="TikTok"
                    onClick={closeMobileMenu}
                  >
                    <FaTiktok className="h-5 w-5 text-white" />
                  </Link>
                </div>
              </div>

              {/* Secure Payment */}
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium uppercase tracking-wide mb-3">
                  🔒 Secure Payment
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">Tabby</span>
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">Tamara</span>
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">Apple Pay</span>
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">Bank</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 pt-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-background border-2 border-primary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-lg"
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
                    size="sm"
                  >
                    {t("search")}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {t("pressEscToClose")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`sticky top-0 z-50 w-full border-b border-border transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-md shadow-lg" 
          : "bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 focus-ring rounded-lg">
          <span className="font-accent text-xl md:text-2xl font-bold tracking-wide hover-underline">108 Store</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6 whitespace-nowrap">
          {[ 
            { href: "/", label: t("home") },
            { href: "/collections/all", label: t("allProducts") },
            { href: "/collections/underwear", label: t("underwear") },
            { href: "/collections/wedding", label: t("wedding") },
            { href: "/collections/abayas", label: t("abayas") },
            { href: "/collections/gym", label: t("gym") },
            { href: "/collections/accessories", label: t("accessories") },
          ].map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link 
                href={item.href} 
                className="relative group hover:text-primary transition-colors duration-200 font-medium tracking-wide text-sm hover-underline focus-ring rounded"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
          </div>
        </nav>
        {/* Actions */}
        <motion.div 
          className="flex items-center gap-2 md:gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Search Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="rounded-full"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Language - Hidden on mobile */}
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="ghost" size="icon" aria-label={t("language")} className="rounded-full">
                    <Globe className="h-4 w-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => setLang("en")} className="rounded-lg">
                  {lang === "en" ? "✓ " : ""}EN
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("ar")} className="rounded-lg">
                  {lang === "ar" ? "✓ " : ""}AR
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Theme Toggle - Hidden on mobile */}
          <div className="hidden sm:block">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-full"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>
          </div>

          {/* Wishlist */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" className="relative rounded-full" asChild>
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                      {wishlistCount}
                    </Badge>
                  </motion.div>
                )}
              </Link>
            </Button>
          </motion.div>

          {/* Cart */}
          <CartSidebar />

          {/* User Menu - Desktop Only */}
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon" aria-label="User menu" className="rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="rounded-lg">{t("profile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="rounded-lg">{t("orders")}</Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="rounded-lg">{t("adminDashboard")}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="rounded-lg">{t("logout")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild className="rounded-full bg-primary hover:bg-primary/90 focus-ring">
                  <Link href="/auth">{t("login")}</Link>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Hamburger Menu Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
    </>
  )
}
