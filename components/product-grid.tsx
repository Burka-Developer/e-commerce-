"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ShoppingCart, Grid, List, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { useReviews } from "@/components/reviews-provider"
import { useToast } from "@/hooks/use-toast"
import { getProductImage } from "@/lib/product-images"
import { ProductGridSkeleton } from "@/components/loading-skeleton"
import { useLanguage } from "@/components/language-provider"

// Fallback demo products when API is empty
const allProducts = [
  {
    id: 1,
    name: "Luxury Abaya Collection",
    price: 299.99,
    image: getProductImage(1),
    badge: "Best Seller",
    inStock: true,
    category: "abayas",
    brand: "premium",
  },
  {
    id: 2,
    name: "Elegant Wedding Dress",
    price: 1299.99,
    image: getProductImage(2),
    badge: "New",
    inStock: true,
    category: "wedding",
    brand: "bridal",
  },
  {
    id: 3,
    name: "Premium Underwear Set",
    price: 49.99,
    image: getProductImage(3),
    badge: "Sale",
    inStock: true,
    category: "underwear",
    brand: "luxury",
  },
  {
    id: 4,
    name: "Active Gym Wear",
    price: 79.99,
    image: getProductImage(4),
    badge: "Popular",
    inStock: true,
    category: "gym",
    brand: "sport",
  },
  {
    id: 5,
    name: "Designer Handbag",
    price: 189.99,
    image: getProductImage(5),
    badge: "Sale",
    inStock: true,
    category: "accessories",
    brand: "designer",
  },
  {
    id: 6,
    name: "Luxury Perfume Set",
    price: 149.99,
    image: getProductImage(6),
    badge: "Featured",
    inStock: true,
    category: "accessories",
    brand: "luxury",
  },
  {
    id: 7,
    name: "Silk Scarf Collection",
    price: 89.99,
    image: getProductImage(7),
    badge: "New",
    inStock: true,
    category: "accessories",
    brand: "silk",
  },
  {
    id: 8,
    name: "Evening Gown",
    price: 599.99,
    image: getProductImage(8),
    badge: "Limited",
    inStock: true,
    category: "wedding",
    brand: "couture",
  },
]

interface ProductGridProps {
  filters?: {
    categories: string[]
    brands: string[]
    priceRange: number[]
    rating: number[]
  }
  searchQuery?: string
}

export function ProductGrid({ filters, searchQuery, sortBy: sortByProp, onSortChange }: ProductGridProps & { sortBy?: string; onSortChange?: (v: string) => void }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [internalSortBy, setInternalSortBy] = useState("featured")
  const [filteredProducts, setFilteredProducts] = useState(allProducts)
  const [loadedProducts, setLoadedProducts] = useState<typeof allProducts | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [visibleCount, setVisibleCount] = useState(8)
  const { t } = useLanguage()

  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const { getProductRating } = useReviews()
  const { toast } = useToast()

  // Load products from API (if available)
  useEffect(() => {
    ;(async () => {
      try {
        setIsLoadingProducts(true)
        const res = await fetch("/api/products", { cache: "no-store" })
        const data = await res.json()
        const products = (data?.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: Array.isArray(p.images) ? p.images[0] : (() => { 
            try { 
              const arr = JSON.parse(p.images || "[]"); 
              return arr?.[0] || getProductImage(p.id); 
            } catch { 
              return getProductImage(p.id); 
            } 
          })(),
          badge: p.badge || undefined,
          inStock: p.in_stock === 1,
          category: String(p.category_name || "" ).toLowerCase() || "",
          brand: p.brand || "",
        }))
        if (products.length) setLoadedProducts(products as any)
      } catch {}
      finally {
        setIsLoadingProducts(false)
      }
    })()
  }, [])

  // Apply filters
  useEffect(() => {
    let source = loadedProducts && loadedProducts.length ? loadedProducts : allProducts
    let filtered = [...source]

    // Filter by search query
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query),
      )
    }

    if (filters) {
      // Filter by categories
      if (filters.categories.length > 0) {
        filtered = filtered.filter((product) => filters.categories.includes(product.category))
      }

      // Filter by brands
      if (filters.brands.length > 0) {
        filtered = filtered.filter((product) => filters.brands.includes(product.brand))
      }

      // Filter by price range
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
        filtered = filtered.filter(
          (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1],
        )
      }

      // Filter by rating
      if (filters.rating.length > 0 && filters.rating[0] > 0) {
        filtered = filtered.filter((product) => {
          const { average } = getProductRating(product.id)
          return average >= filters.rating[0]
        })
      }
    }

    // Apply sorting
    const effectiveSort = sortByProp ?? internalSortBy
    switch (effectiveSort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        filtered.sort((a, b) => b.id - a.id)
        break
      default:
        // Keep original order for featured
        break
    }

    setFilteredProducts(filtered)
    // Reset pagination when filters/sort/search/source change
    setVisibleCount(8)
  }, [filters, sortByProp, internalSortBy, searchQuery, getProductRating, loadedProducts])

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    toast({
      title: t("addedToCartTitle"),
      description: `${product.name} ${t("addedToCartDesc")}`,
    })
  }

  const handleWishlistToggle = (product: any) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: t("removedFromWishlistTitle"),
        description: `${product.name} ${t("removedFromWishlistDesc")}`,
        variant: "destructive",
      })
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
      toast({
        title: t("addedToWishlistTitle"),
        description: `${product.name} ${t("addedToWishlistDesc")}`,
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-sm text-muted-foreground font-medium">
            {t("showing")} {filteredProducts.length} {t("of")} {allProducts.length} {t("productsLower")}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block">
          <Select value={sortByProp ?? internalSortBy} onValueChange={(v) => onSortChange ? onSortChange(v) : setInternalSortBy(v)}>
            <SelectTrigger className="w-48 rounded-full border-2 border-transparent focus:border-primary transition-all duration-300">
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="featured">{t("featured")}</SelectItem>
              <SelectItem value="price-low">{t("priceLowToHigh")}</SelectItem>
              <SelectItem value="price-high">{t("priceHighToLow")}</SelectItem>
              <SelectItem value="newest">{t("newest")}</SelectItem>
            </SelectContent>
          </Select>
          </div>
          <div className="hidden sm:flex items-center border-2 border-muted rounded-full overflow-hidden">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Products Grid/List */}
      <AnimatePresence mode="wait">
        {isLoadingProducts ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-muted-foreground text-lg mb-4">{t("noProductsFound")}</p>
            <p className="text-sm text-muted-foreground">{t("tryAdjustFilters")}</p>
          </motion.div>
        ) : (
          <>
          <motion.div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3"
                : "grid grid-cols-1 gap-3"
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredProducts.slice(0, visibleCount).map((product, index) => {

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    className={`group hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30 rounded-lg overflow-hidden bg-white dark:bg-gray-900 flex flex-col h-full ${
                      viewMode === "list" ? "flex-row" : ""
                    }`}
                  >
                    <CardContent className="p-0 flex-shrink-0">
                      <div
                        className={`relative overflow-hidden bg-muted flex items-center justify-center ${
                          viewMode === "list" ? "w-40 aspect-square" : "w-full aspect-[4/5] sm:aspect-[3/4]"
                        }`}
                      >
                        <Link href={`/products/${product.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full"
                          >
                            <Image
                              src={product.image || "/products/item1.jpg"}
                              alt={product.name}
                              width={300}
                              height={400}
                              className="object-cover w-full h-full p-0"
                              priority={index < 4}
                              loading={index < 4 ? "eager" : "lazy"}
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                            />
                          </motion.div>
                        </Link>
                        
                        <motion.div
                          className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={{ opacity: 0, x: 20 }}
                          whileHover={{ opacity: 1, x: 0 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="icon"
                              variant="secondary"
                              className={`opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full shadow-lg backdrop-blur-sm ${
                                isInWishlist(product.id) ? "text-red-500 bg-red-50" : "bg-white/90"
                              }`}
                              onClick={() => handleWishlistToggle(product)}
                            >
                              <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                            </Button>
                          </motion.div>
                          
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="icon"
                              variant="secondary"
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full shadow-lg backdrop-blur-sm bg-white/90"
                              asChild
                            >
                              <Link href={`/products/${product.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </motion.div>
                        </motion.div>
                        
                        {!product.inStock && (
                          <motion.div 
                            className="absolute inset-0 bg-black/60 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="text-center">
                              <Badge variant="destructive" className="mb-2 rounded-full">
                                {t("outOfStock")}
                              </Badge>
                              <p className="text-white text-xs">{t("addToWishlist")}</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                  {viewMode === "list" && (
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between h-full">
                        <div className="flex-1 min-w-0 pr-6">
                          <Link href={`/products/${product.id}`} className="focus-ring">
                            <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2 cursor-pointer hover-underline">
                              {product.name}
                            </h3>
                          </Link>
                          {/* ratings removed */}
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-2xl font-bold text-primary">${product.price}</span>
                            {product.badge && (
                              <Badge variant="secondary" className="rounded-full text-xs">
                                {product.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {product.category === "underwear" && t("listUnderwear")}
                            {product.category === "abayas" && t("listAbayas")}
                            {product.category === "accessories" && t("listAccessories")}
                            {product.category === "gym" && t("listGym")}
                            {product.category === "wedding" && t("listWedding")}
                            {!product.category && t("listDefault")}
                          </p>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`flex items-center text-xs px-2 py-1 rounded-full ${
                                product.inStock ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mr-1 ${product.inStock ? "bg-green-500" : "bg-red-500"}`}
                              ></div>
                              {product.inStock ? t("inStock") : t("outOfStock")}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-3 flex-shrink-0">
                          <Button
                            size="default"
                            disabled={!product.inStock}
                            onClick={() => handleAddToCart(product)}
                            className="min-w-[140px] h-10"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.inStock ? t("addToCart") : t("outOfStock")}
                          </Button>
                          <Button
                            size="default"
                            variant="outline"
                            onClick={() => handleWishlistToggle(product)}
                            className={`min-w-[140px] h-10 ${isInWishlist(product.id) ? "text-red-500 border-red-200" : ""}`}
                          >
                            <Heart className={`h-4 w-4 mr-2 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                            {isInWishlist(product.id) ? t("inWishlist") : t("addToWishlist")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                    {viewMode === "grid" && (
                      <>
                        <div className="p-2.5 sm:p-3">
                          <Link href={`/products/${product.id}`} className="focus-ring">
                            <h3 className="font-semibold text-[13px] sm:text-sm mb-1.5 hover:text-primary transition-colors cursor-pointer line-clamp-2 hover-underline">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm sm:text-base font-bold text-primary">${product.price}</span>
                              {product.badge && (
                                <Badge variant="outline" className="text-xs rounded-full border-primary/30 text-primary">
                                  {product.badge}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <CardFooter className="p-2.5 sm:p-3 pt-0">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg h-8 sm:h-9 text-[12px] sm:text-xs" 
                              disabled={!product.inStock} 
                              onClick={() => handleAddToCart(product)}
                              size="sm"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {product.inStock ? t("addToCart") : t("outOfStock")}
                            </Button>
                          </motion.div>
                        </CardFooter>
                      </>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
          {/* Load more */}
          {filteredProducts.length > visibleCount && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" className="rounded-full" onClick={() => setVisibleCount((c) => c + 8)}>
                {t("loadMore")}
              </Button>
            </div>
          )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
