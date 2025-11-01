"use client"

import { useMemo, useState } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"

const ALLOWED: Record<string, { category?: string; title: string; desc: string }> = {
  all: { title: "All Products", desc: "Browse all products across our collections." },
  accessories: { category: "accessories", title: "Accessories", desc: "Designer bags, scarves, perfumes and more." },
  "gym-wear": { category: "gym wear", title: "Gym Wear", desc: "Activewear for performance and style." },
  hoodies: { category: "hoodies", title: "Hoodies", desc: "Comfortable, stylish hoodies for every day." },
  "wedding-clothes": { category: "wedding clothes", title: "Wedding Clothes", desc: "Elegant wedding dresses and occasion wear." },
  abayas: { category: "abayas", title: "Abayas", desc: "Luxury abayas with modern silhouettes." },
}

export default function CollectionPage() {
  const params = useParams()
  const slug = String(params?.slug || "").toLowerCase()
  const meta = ALLOWED[slug]
  const searchParams = useSearchParams()
  const searchQueryParam = searchParams?.get("search") || ""
  const { t } = useLanguage()

  const [filters, setFilters] = useState({
    categories: meta?.category ? [meta.category] : [],
    brands: [] as string[],
    priceRange: [0, 1000] as number[],
    rating: [0] as number[],
  })
  const [sortBy, setSortBy] = useState("featured")

  const searchQuery = useMemo(() => searchQueryParam, [searchQueryParam])

  if (!meta) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Collection not found</h1>
          <p className="text-muted-foreground">Please use the navigation to browse available categories.</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
  <div className="mb-4 flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t("home")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/collections/${slug}`}>
                  {meta.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

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
                  <ProductFilters onFiltersChange={(f) => setFilters({ ...f, categories: meta?.category ? [meta.category] : f.categories })} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">{meta.title}</h1>
        <p className="text-muted-foreground mb-6">{meta.desc}</p>
        <Separator className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <ProductFilters
              onFiltersChange={(f) => setFilters({ ...f, categories: meta?.category ? [meta.category] : f.categories })}
            />
          </aside>
          <section className="lg:col-span-3">
            <ProductGrid filters={filters} searchQuery={searchQuery} sortBy={sortBy} onSortChange={setSortBy} />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}


