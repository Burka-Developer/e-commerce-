"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  type Filters = { categories: string[]; brands: string[]; priceRange: number[]; rating: number[] }
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    brands: [],
    priceRange: [0, 1000],
    rating: [0],
  })
  const [sortBy, setSortBy] = useState("featured")

  // Get search query from URL params
  useEffect(() => {
    if (!searchParams) return
    const query = searchParams.get("search")
    if (query) {
      setSearchQuery(decodeURIComponent(query))
    }
  }, [searchParams])

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters)
  }, [])

  const clearSearch = () => {
    setSearchQuery("")
    // Update URL to remove search parameter
    window.history.pushState({}, "", "/products")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-4">
                {searchQuery ? `Search Results for "${searchQuery}"` : t("allProducts")}
              </h1>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `Showing products matching "${searchQuery}"`
                  : "Discover our complete collection of quality products"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile Filters Button */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                      <Filter className="h-4 w-4 mr-2" /> {t("filters")}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-sm p-0">
                    <div className="p-4 border-b">
                      <SheetHeader>
                        <SheetTitle>{t("filters")}</SheetTitle>
                      </SheetHeader>
                    </div>
                    <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
                      {/* Sorting (mobile) */}
                      <div>
                        <p className="text-sm font-medium mb-2">{t("sortBy")}</p>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-full rounded-xl">
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
                      <ProductFilters onFiltersChange={handleFiltersChange} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              {searchQuery && (
                <Button variant="outline" onClick={clearSearch} className="flex items-center space-x-2 bg-transparent rounded-full">
                  <X className="h-4 w-4" />
                  <span>{t("clearSearch")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <ProductFilters onFiltersChange={handleFiltersChange} />
          </aside>
          <div className="lg:col-span-3">
            <ProductGrid filters={filters} searchQuery={searchQuery} sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
