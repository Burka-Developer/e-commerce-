// Demo-mode mock data used when DEMO_AUTH_ENABLED=true

export const demoCategories = [
  { id: 1, name: "Accessories" },
  { id: 2, name: "Gym Wear" },
  { id: 3, name: "Hoodies" },
  { id: 4, name: "Wedding Clothes" },
  { id: 5, name: "Abayas" },
]

export const demoProducts = [
  {
    id: 101,
    name: "Wireless Headphones",
    description: "Noise-cancelling over-ear headphones with 30h battery.",
    price: 129.99,
    original_price: 179.99,
    category_id: 1,
    brand: "SoundMax",
    images: JSON.stringify(["/placeholder.jpg"]),
    in_stock: 1,
    stock_quantity: 42,
    badge: "Best Seller",
    features: JSON.stringify(["Noise cancelling", "Bluetooth 5.3", "30h battery"]),
    specifications: JSON.stringify({ color: "Black", weight: "250g" }),
    updated_at: new Date().toISOString(),
  },
  {
    id: 102,
    name: "Smartwatch Pro",
    description: "Water-resistant smartwatch with GPS and heart rate.",
    price: 199.0,
    original_price: null,
    category_id: 1,
    brand: "FitPulse",
    images: JSON.stringify(["/placeholder.jpg"]),
    in_stock: 1,
    stock_quantity: 18,
    badge: "New",
    features: JSON.stringify(["GPS", "Heart rate", "Water-resistant"]),
    specifications: JSON.stringify({ size: "42mm" }),
    updated_at: new Date().toISOString(),
  },
]

export const demoCoupons = [
  { id: 1, code: "WELCOME10", description: "10% off first order", type: "percentage", value: 10, is_active: 1, updated_at: new Date().toISOString() },
  { id: 2, code: "FLAT50", description: "Flat $50 off over $500", type: "fixed", value: 50, min_order_amount: 500, is_active: 1, updated_at: new Date().toISOString() },
]
