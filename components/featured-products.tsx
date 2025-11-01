"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { useReviews } from "@/components/reviews-provider"
import { useToast } from "@/hooks/use-toast"
import { getProductImage } from "@/lib/product-images"
import { useLanguage } from "@/components/language-provider"

const featuredProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    originalPrice: 129.99,
    image: getProductImage(1),
    badge: "Best Seller",
    inStock: false,
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    originalPrice: 249.99,
    image: getProductImage(2),
    badge: "New",
    inStock: true,
  },
  {
    id: 3,
    name: "Laptop Backpack",
    price: 49.99,
    originalPrice: 69.99,
    image: getProductImage(3),
    badge: "Sale",
    inStock: true,
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: 79.99,
    originalPrice: 99.99,
    image: getProductImage(4),
    badge: "Popular",
    inStock: false,
  },
]

export function FeaturedProducts() {
  const { t } = useLanguage()
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const { getProductRating } = useReviews()
  const { toast } = useToast()

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleWishlistToggle = (product: any) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
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
        title: "Added to wishlist!",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-display text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 tracking-tight">{t("featuredTitle")}</h2>
          <p className="text-xs md:text-base text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            {t("featuredDesc")}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {featuredProducts.map((product) => {
            const { average: rating, count: reviewCount } = getProductRating(product.id)

            return (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/30 rounded-xl overflow-hidden bg-white dark:bg-gray-900 h-full">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Link href={`/products/${product.id}`}>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={280}
                        height={280}
                        className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        priority={true}
                      />
                    </Link>
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      {product.badge}
                    </Badge>
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isInWishlist(product.id) ? "text-red-500" : ""
                      }`}
                      onClick={() => handleWishlistToggle(product)}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                    </Button>
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center">
                          <Badge variant="destructive" className="mb-1">
                            {t("outOfStock")}
                          </Badge>
                          <p className="text-white text-xs">{t("addToWishlist")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-3">
                    <Link href={`/products/${product.id}`} className="focus-ring">
                      <h3 className="font-medium text-xs sm:text-sm md:text-base mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2 hover-underline tracking-wide">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">
                        {reviewCount > 0 ? `(${reviewCount})` : "(0)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-display text-sm sm:text-base md:text-lg font-bold tracking-tight">${product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-through font-light">${product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-2 sm:p-3 pt-0">
                  <Button className="w-full h-9 sm:h-10 text-xs sm:text-sm" disabled={!product.inStock} onClick={() => handleAddToCart(product)} size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.inStock ? t("addToCart") : t("outOfStock")}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
        <div className="text-center mt-8 md:mt-12">
          <Button variant="outline" size="lg" asChild className="rounded-full px-6 py-5 md:px-8 md:py-6 h-auto font-medium tracking-wide">
            <Link href="/products">{t("viewAllProducts")}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
