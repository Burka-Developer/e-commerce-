"use client"

import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { motion } from "framer-motion"
import useSWR from "swr"

type Category = { id: number; name: string; description?: string | null; image?: string | null }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function toSlug(name: string): string {
  const map: Record<string, string> = {
    "Accessories": "accessories",
    "Gym Wear": "gym-wear",
    "Hoodies": "hoodies",
    "Wedding Clothes": "wedding-clothes",
    "Abayas": "abayas",
  }
  return map[name] || name.toLowerCase().replace(/\s+/g, "-")
}

export function Categories() {
  const { t } = useLanguage()
  const { data } = useSWR<{ categories: Category[] }>("/api/categories", fetcher)
  const categories = data?.categories?.slice(0, 5) || []

  return (
    <section className="py-16 md:py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:3xl lg:text-4xl font-bold mb-4 tracking-tight">{t("shopByCategory")}</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            108 offers curated selections across every occasion with refined taste.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, i) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link href={`/collections/${toSlug(category.name)}`} className="block focus-ring rounded-xl">
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer rounded-xl">
                  <CardContent className="p-4 text-center">
                    <div className="relative mb-4 overflow-hidden rounded-lg aspect-square">
                      {category.image?.startsWith("/") ? (
                        <Image src={category.image} alt={category.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : category.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <Image src="/products/item1.jpg" alt={category.name} fill className="object-cover" />
                      )}
                    </div>
                    <h3 className="font-accent text-base md:text-lg font-semibold mb-1 hover-underline inline-block tracking-wide">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
