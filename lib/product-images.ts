// Product image utility functions
const productImages = [
  "/products/item1.jpg",
  "/products/item2.jpg", 
  "/products/item3.jpg",
  "/products/item4.jpg",
  "/products/item5.jpg",
  "/products/item6.jpg",
  "/products/item7.jpg",
  "/products/item8.jpg",
  "/products/item9.jpg",
  "/products/item10.jpg",
  "/products/female dress.webp",
  "/products/female.webp",
  "/products/glasses.webp",
  "/products/jewlery.webp",
  "/products/male dress.webp",
  "/products/watch.webp"
]

export function getProductImage(productId: number, fallback?: string): string {
  // Use product ID to cycle through available images
  const imageIndex = (productId - 1) % productImages.length
  return productImages[imageIndex] || fallback || "/placeholder.svg"
}

export function getRandomProductImage(): string {
  const randomIndex = Math.floor(Math.random() * productImages.length)
  return productImages[randomIndex]
}

export function getAllProductImages(): string[] {
  return [...productImages]
}



