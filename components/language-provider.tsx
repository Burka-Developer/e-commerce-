"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Lang = "en" | "ar"

type Dictionary = Record<string, string>
const dict: Record<Lang, Dictionary> = {
  en: {
    brand: "108",
    home: "Home",
    products: "Products",
    categories: "Categories",
    about: "About",
    contact: "Contact",
    underwear: "Underwear",
    wedding: "Wedding Clothes",
    abayas: "Abayas",
    gym: "Gym Wear",
    accessories: "Accessories",
    allProducts: "All Products",
    allDesc: "Discover our complete collection of quality products.",
  underwearDesc: "Comfort-first underwear curated for everyday confidence.",
  weddingDesc: "Elegant wedding outfits crafted for unforgettable moments.",
  abayasDesc: "Modern abayas blending tradition with contemporary style.",
  gymDesc: "Performance gym wear engineered for movement.",
  accessoriesDesc: "Finish your look with timeless accessories.",
  // List-view category snippets
  listUnderwear: "Comfort-first basics designed for everyday confidence.",
  listAbayas: "Modern abayas blending tradition with contemporary style.",
  listAccessories: "Timeless accents to elevate every outfit.",
  listGym: "Breathable performance wear built to move with you.",
  listWedding: "Elegant silhouettes crafted for unforgettable moments.",
  listDefault: "Quality pieces at great value for daily wear.",
    faq: "FAQ",
    qnas: "Q&As",
    support: "Support",
    trackOrder: "Track Order",
  profile: "Profile",
  orders: "Orders",
  adminDashboard: "Admin Dashboard",
  logout: "Logout",
  login: "Login",
  loginSignup: "Login / Sign Up",
    discover: "Discover Amazing",
    productsWord: "Products",
  heroTagline: "108 curates luxury Abayas, Wedding Clothes, Underwear, Gym Wear, and Accessories with modern elegance and timeless style.",
  featuredTitle: "Featured Products",
  featuredDesc: "Discover our handpicked selection of trending and popular products",
  viewAllProducts: "View All Products",
  followUs: "Follow Us",
  quickLinks: "Quick Links",
  customerService: "Customer Service",
  aboutUs: "About Us",
  shippingInfo: "Shipping Info",
  returnsExchanges: "Returns & Exchanges",
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
  supportCenter: "Support Center",
  about108: "About 108",
  luxuryFashionRedefined: "Luxury Fashion Redefined",
  aboutIntro: "Welcome to 108 - your destination for exquisite luxury Abayas, wedding wear, underwear, gym wear, and accessories. We believe fashion is an expression of elegance and confidence.",
  premiumQuality: "Premium Quality",
  premiumQualityDesc: "Carefully curated luxury collection with finest materials and craftsmanship",
  customerFirst: "Customer First",
  customerFirstDesc: "Dedicated support team available 24/7 to help with your queries",
  styleElegance: "Style & Elegance",
  styleEleganceDesc: "Modern designs combined with timeless style for every occasion",
  fastDelivery: "Fast Delivery",
  fastDeliveryDesc: "Quick and reliable delivery service across all regions",
  chat: "Chat",
  chatInitial: "Hi! I’m your AI assistant for 108. I can help with orders, payments, shipping, returns, and product questions. How can I help today?",
  thinking: "Thinking…",
  aiPrivacyNote: "AI can make mistakes. For account-specific help, don’t share sensitive info here—use Contact.",
    shopNow: "Shop Now",
    browseCategories: "Browse Categories",
    shopByCategory: "Shop by Category",
    items: "items",
    language: "Language",
    searchPlaceholder: "Search for products...",
    search: "Search",
    pressEscToClose: "Press ESC to close",
    clearSearch: "Clear Search",
    activeFilters: "Active Filters",
    categoriesLabel: "Categories",
    priceRange: "Price Range",
    brands: "Brands",
    minRating: "Minimum Rating",
    filters: "Filters",
    apply: "Apply",
    clearAll: "Clear All",
    sortBy: "Sort by",
    featured: "Featured",
    priceLowToHigh: "Price: Low to High",
    priceHighToLow: "Price: High to Low",
    newest: "Newest",
    showing: "Showing",
    of: "of",
    productsLower: "products",
    // Product & toast labels
    addToCart: "Add to Cart",
    outOfStock: "Out of Stock",
    inStock: "In Stock",
    addToWishlist: "Add to wishlist",
    inWishlist: "In Wishlist",
    addedToCartTitle: "Added to cart!",
    addedToCartDesc: "has been added to your cart.",
    removedFromWishlistTitle: "Removed from wishlist",
    removedFromWishlistDesc: "has been removed from your wishlist.",
    addedToWishlistTitle: "Added to wishlist!",
    addedToWishlistDesc: "has been added to your wishlist.",
    noProductsFound: "No products found matching your criteria",
    tryAdjustFilters: "Try adjusting your filters or search terms",
    loadMore: "Load more",
  },
  ar: {
    brand: "١٠٨",
    home: "الرئيسية",
    products: "المنتجات",
    categories: "الفئات",
    about: "حول",
    contact: "تواصل",
    underwear: "ملابس داخلية",
    wedding: "ملابس الزفاف",
    abayas: "عبايات",
    gym: "ملابس رياضية",
    accessories: "إكسسوارات",
    allProducts: "كل المنتجات",
    allDesc: "اكتشف مجموعتنا الكاملة من المنتجات عالية الجودة.",
  underwearDesc: "ملابس داخلية مريحة تمنحك الثقة في كل يوم.",
  weddingDesc: "أزياء زفاف أنيقة مصممة للحظات لا تُنسى.",
  abayasDesc: "عبايات عصرية تمزج بين الأصالة والحداثة.",
  gymDesc: "ملابس رياضية عالية الأداء مصممة للحركة.",
  accessoriesDesc: "أكملي إطلالتك بإكسسوارات خالدة.",
  // List-view category snippets
  listUnderwear: "أساسيات مريحة تمنحك الثقة كل يوم.",
  listAbayas: "عبايات عصرية تمزج بين الأصالة والحداثة.",
  listAccessories: "لمسات خالدة ترتقي بأي إطلالة.",
  listGym: "ملابس رياضية قابلة للتنفس تُصمم لتتحرك معك.",
  listWedding: "قصّات أنيقة مصممة للحظات لا تُنسى.",
  listDefault: "قطع عالية الجودة بقيمة رائعة للاستخدام اليومي.",
    faq: "الأسئلة الشائعة",
    qnas: "الأسئلة والأجوبة",
    support: "الدعم",
    trackOrder: "تتبع الطلب",
  profile: "الملف الشخصي",
  orders: "الطلبات",
  adminDashboard: "لوحة تحكم المشرف",
  logout: "تسجيل الخروج",
  login: "تسجيل الدخول",
  loginSignup: "تسجيل الدخول / إنشاء حساب",
  discover: "اكتشف منتجات",
  productsWord: "مذهلة",
  heroTagline: "108 تقدّم مجموعة فاخرة من العبايات، ملابس الزفاف، الملابس الداخلية، الملابس الرياضية، والإكسسوارات بلمسة عصرية وأناقة زمنية.",
  featuredTitle: "منتجات مميزة",
  featuredDesc: "تعرّف على مجموعتنا المختارة من المنتجات الرائجة والشائعة",
  viewAllProducts: "عرض كل المنتجات",
  followUs: "تابعنا",
  quickLinks: "روابط سريعة",
  customerService: "خدمة العملاء",
  aboutUs: "معلومات عنا",
  shippingInfo: "معلومات الشحن",
  returnsExchanges: "الإرجاع والاستبدال",
  privacyPolicy: "سياسة الخصوصية",
  termsOfService: "شروط الخدمة",
  supportCenter: "مركز الدعم",
  about108: "عن ١٠٨",
  luxuryFashionRedefined: "أناقة فاخرة بمعايير جديدة",
  aboutIntro: "مرحباً بك في ١٠٨ — وجهتك للعبايات الفاخرة وملابس الزفاف والملابس الداخلية والرياضية والإكسسوارات. نؤمن بأن الأناقة لغة للثقة والجمال.",
  premiumQuality: "جودة عالية",
  premiumQualityDesc: "مجموعة فاخرة منتقاة بأفضل الخامات وحِرفية متقنة",
  customerFirst: "العميل أولاً",
  customerFirstDesc: "فريق دعم متواجد 24/7 لمساعدتك في كل الاستفسارات",
  styleElegance: "أسلوب وأناقة",
  styleEleganceDesc: "تصاميم عصرية تمتزج مع الأناقة الكلاسيكية لكل المناسبات",
  fastDelivery: "توصيل سريع",
  fastDeliveryDesc: "خدمة توصيل سريعة وموثوقة إلى جميع المناطق",
  chat: "المحادثة",
  chatInitial: "مرحباً! أنا مساعد ١٠٨ الذكي. أستطيع المساعدة في الطلبات والمدفوعات والشحن والإرجاع والأسئلة حول المنتجات. كيف أستطيع خدمتك اليوم؟",
  thinking: "جارٍ التفكير…",
  aiPrivacyNote: "قد يخطئ الذكاء الاصطناعي. للمساعدة الخاصة بالحساب، لا تشارك معلومات حساسة هنا — استخدم صفحة التواصل.",
    shopNow: "تسوق الآن",
    browseCategories: "تصفح الفئات",
    shopByCategory: "تسوق حسب الفئة",
    items: "عنصر",
    language: "اللغة",
    searchPlaceholder: "ابحث عن المنتجات...",
    search: "بحث",
    pressEscToClose: "اضغط ESC للإغلاق",
    clearSearch: "مسح البحث",
    activeFilters: "عوامل التصفية النشطة",
    categoriesLabel: "الفئات",
    priceRange: "نطاق السعر",
    brands: "العلامات التجارية",
    minRating: "التقييم الأدنى",
    filters: "تصفية",
    apply: "تطبيق",
    clearAll: "مسح الكل",
    sortBy: "الترتيب حسب",
    featured: "مميز",
    priceLowToHigh: "السعر: من الأقل إلى الأعلى",
    priceHighToLow: "السعر: من الأعلى إلى الأقل",
    newest: "الأحدث",
    showing: "عرض",
    of: "من",
    productsLower: "منتج",
    // Product & toast labels
    addToCart: "أضف إلى السلة",
    outOfStock: "غير متوفر",
    inStock: "متوفر",
    addToWishlist: "أضف إلى المفضلة",
    inWishlist: "في المفضلة",
    addedToCartTitle: "تمت الإضافة إلى السلة!",
    addedToCartDesc: "تمت إضافته إلى سلتك.",
    removedFromWishlistTitle: "تمت الإزالة من المفضلة",
    removedFromWishlistDesc: "تمت إزالته من المفضلة.",
    addedToWishlistTitle: "تمت الإضافة إلى المفضلة!",
    addedToWishlistDesc: "تمت إضافته إلى المفضلة.",
    noProductsFound: "لا توجد منتجات مطابقة لمعاييرك",
    tryAdjustFilters: "جرّب تعديل عوامل التصفية أو كلمات البحث",
    loadMore: "عرض المزيد",
  },
}

type LanguageContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: keyof (typeof dict)["en"]) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to Arabic; will hydrate from localStorage if present
  const [lang, setLangState] = useState<Lang>("ar")

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("lang") as Lang)) || "ar"
    setLangState(saved)
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
      document.documentElement.lang = lang
      localStorage.setItem("lang", lang)
    }
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)
  const t = useMemo(() => {
    const table = dict[lang]
    return (key: keyof (typeof dict)["en"]) => table[key] ?? String(key)
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
