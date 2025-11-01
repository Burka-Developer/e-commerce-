import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

// Align categories with existing collections slugs
const categories = [
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Designer bags, scarves, perfumes and more',
    image: '/placeholder.svg?height=300&width=400',
    count: 200,
    subcategories: ['Bags', 'Scarves', 'Perfumes'],
  },
  {
    id: 'gym-wear',
    name: 'Gym Wear',
    description: 'Activewear for performance and style',
    image: '/placeholder.svg?height=300&width=400',
    count: 95,
    subcategories: ['Tops', 'Leggings', 'Accessories'],
  },
  {
    id: 'hoodies',
    name: 'Hoodies',
    description: 'Comfortable, stylish hoodies for every day',
    image: '/placeholder.svg?height=300&width=400',
    count: 120,
    subcategories: ['Zip-Up', 'Pullover', 'Oversized'],
  },
  {
    id: 'wedding-clothes',
    name: 'Wedding Clothes',
    description: 'Elegant wedding dresses and occasion wear',
    image: '/placeholder.svg?height=300&width=400',
    count: 80,
    subcategories: ['Gowns', 'Veils', 'Accessories'],
  },
  {
    id: 'abayas',
    name: 'Abayas',
    description: 'Luxury abayas with modern silhouettes',
    image: '/placeholder.svg?height=300&width=400',
    count: 150,
    subcategories: ['Classic', 'Embroidered', 'Occasion'],
  },
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of categories and find exactly what you're looking for. From electronics to fashion,
            we have everything you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/collections/${category.id}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full rounded-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 right-4" variant="secondary">
                      {category.count} items
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{category.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.map((sub) => (
                        <Badge key={sub} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
