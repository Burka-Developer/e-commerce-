"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash, Upload } from "lucide-react"
import Image from "next/image"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Package, TrendingUp, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/client-api"

type Product = {
  id: number
  name: string
  description: string
  price: number
  original_price?: number | null
  category_id?: number | null
  category_name?: string | null
  brand?: string | null
  images?: string[] | null
  in_stock: 0 | 1
  stock_quantity: number
  badge?: string | null
  features?: string[] | null
  specifications?: Record<string, string> | null
}

type Category = { id: number; name: string }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [{ products }, { categories }] = await Promise.all([
        apiGet<{ products: Product[] }>("/api/products"),
        apiGet<{ categories: Category[] }>("/api/categories"),
      ])
      setProducts(products)
      setCategories(categories)
    } catch (e) {
      toast({ title: "Failed to load products", variant: "destructive" })
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || String(product.category_id) === categoryFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in-stock" && product.in_stock === 1) ||
      (statusFilter === "out-of-stock" && product.in_stock === 0)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const body = {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      price: Number(formData.get("price")),
      originalPrice: formData.get("originalPrice") ? Number(formData.get("originalPrice")) : null,
      categoryId: formData.get("category") ? Number(formData.get("category")) : null,
      brand: String(formData.get("brand") || ""),
      inStock: formData.get("inStock") === "on",
      stockQuantity: Number(formData.get("stockQuantity") || 0),
      badge: String(formData.get("badge") || "") || null,
      images: String(formData.get("images") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      features: String(formData.get("features") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      specifications: (() => {
        const raw = String(formData.get("specifications") || "")
        if (!raw) return {}
        try {
          return JSON.parse(raw)
        } catch {
          toast({ title: "Specifications must be valid JSON.", variant: "destructive" })
          return null
        }
      })(),
    }
    if (body.specifications === null) return

    try {
      if (currentProduct) {
        await apiPatch(`/api/products/${currentProduct.id}`, body)
        toast({ title: "Product updated" })
      } else {
        await apiPost("/api/products", body)
        toast({ title: "Product added" })
      }
      setIsAddEditModalOpen(false)
      setCurrentProduct(null)
      await loadData()
    } catch {
      toast({ title: "Failed to save product", variant: "destructive" })
    }
  }

  const openAddModal = () => {
    setCurrentProduct(null)
    setSelectedCategoryId("")
    setIsAddEditModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setCurrentProduct(product)
    setSelectedCategoryId(product.category_id ? String(product.category_id) : "")
    setIsAddEditModalOpen(true)
  }

  const openDeleteConfirmModal = (id: number) => {
    setProductToDelete(id)
    setIsDeleteConfirmModalOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (productToDelete == null) return
    try {
      await apiDelete(`/api/products/${productToDelete}`)
      toast({ title: "Product deleted" })
      setIsDeleteConfirmModalOpen(false)
      setProductToDelete(null)
      await loadData()
    } catch {
      toast({ title: "Failed to delete product", variant: "destructive" })
    }
  }

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.in_stock === 1).length,
    outOfStock: products.filter((p) => p.in_stock === 0).length,
    lowStock: products.filter((p) => p.in_stock === 1 && p.stock_quantity < 10).length,
  }

  const isRTL = typeof document !== "undefined" && document?.dir === "rtl"
  return (
    <div className={`flex h-screen bg-background ${isRTL ? "flex-row-reverse" : ""}`}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/50 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Products</h1>
                <p className="text-muted-foreground">Manage your store products</p>
              </div>
              <Button onClick={openAddModal}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Products ({filteredProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Image
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
                          <Badge variant={product.in_stock === 1 ? "default" : "destructive"}>
                            {product.in_stock === 1 ? "In Stock" : "Out of Stock"}
                          </Badge>
                          {product.in_stock === 1 && product.stock_quantity < 10 && (
                            <Badge variant="outline" className="text-orange-600">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.brand} • {product.category_name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-bold">${product.price.toFixed(2)}</span>
                          {product.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.original_price.toFixed(2)}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</span>
                        </div>
                        {product.features && product.features.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">Features: {product.features.join(", ")}</p>
                        )}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Specs:{" "}
                            {Object.entries(product.specifications)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openDeleteConfirmModal(product.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No products found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEditProduct} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" defaultValue={currentProduct?.name || ""} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={currentProduct?.description || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={currentProduct?.price || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="originalPrice" className="text-right">
                Original Price
              </Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                step="0.01"
                defaultValue={currentProduct?.original_price || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              {/* Radix Select doesn't submit a value by default; mirror into hidden input */}
              <input type="hidden" name="category" value={selectedCategoryId} required />
              <Select value={selectedCategoryId} onValueChange={(v) => setSelectedCategoryId(v)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">
                Brand
              </Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={currentProduct?.brand || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="images" className="text-right">
                Image URLs (comma-separated)
              </Label>
              <Input
                id="images"
                name="images"
                defaultValue={currentProduct?.images?.join(", ") || ""}
                className="col-span-3"
                placeholder="/placeholder.svg?height=300&width=300, /image2.jpg"
              />
            </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Upload Image</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input id="file" type="file" accept="image/*" className="flex-1" />
              <Button type="button" variant="outline" disabled={isUploading} onClick={async () => {
                try {
                  const input = document.getElementById('file') as HTMLInputElement | null
                  if (!input || !input.files || !input.files[0]) {
                    toast({ title: 'Select a file first', variant: 'destructive' })
                    return
                  }
                  const file = input.files[0]
                  const maxBytes = 5 * 1024 * 1024 // 5MB (mirror server limit)
                  if (file.size > maxBytes) {
                    toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' })
                    return
                  }
                  const allowed = ['image/png','image/jpeg','image/jpg','image/webp','image/gif','image/svg+xml']
                  if (!allowed.includes(file.type)) {
                    toast({ title: 'Unsupported file type', description: 'Use PNG, JPG, WEBP, GIF or SVG', variant: 'destructive' })
                    return
                  }
                  setIsUploading(true)
                  const fd = new FormData(); fd.append('file', file)
                  const res = await fetch('/api/products/upload', { method: 'POST', body: fd })
                  const data = await res.json().catch(() => ({}))
                  if (!res.ok) {
                    const reason = data?.error || `${res.status} ${res.statusText}`
                    toast({ title: 'Upload failed', description: reason, variant: 'destructive' })
                    return
                  }
                  const url = data?.url
                  if (url) {
                    const imagesEl = document.getElementById('images') as HTMLInputElement
                    const current = imagesEl.value.trim()
                    imagesEl.value = current ? `${current}, ${url}` : url
                    toast({ title: 'Image uploaded', description: 'Saved as WebP', variant: 'default' })
                  } else {
                    toast({ title: 'Upload failed', description: 'No URL returned', variant: 'destructive' })
                  }
                } catch (e: any) {
                  toast({ title: 'Upload failed', description: String(e?.message || e), variant: 'destructive' })
                } finally {
                  setIsUploading(false)
                }
              }}>
                <Upload className={`h-4 w-4 mr-2 ${isUploading ? 'animate-pulse' : ''}`} /> {isUploading ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
          </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stockQuantity" className="text-right">
                Stock Quantity
              </Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                defaultValue={currentProduct?.stock_quantity || 0}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="badge" className="text-right">
                Badge
              </Label>
              <Input
                id="badge"
                name="badge"
                defaultValue={currentProduct?.badge || ""}
                className="col-span-3"
                placeholder="e.g., Best Seller, New"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="features" className="text-right">
                Features (comma-separated)
              </Label>
              <Input
                id="features"
                name="features"
                defaultValue={currentProduct?.features?.join(", ") || ""}
                className="col-span-3"
                placeholder="Feature 1, Feature 2"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specifications" className="text-right">
                Specifications (JSON format)
              </Label>
              <Textarea
                id="specifications"
                name="specifications"
                defaultValue={currentProduct?.specifications ? JSON.stringify(currentProduct.specifications) : ""}
                className="col-span-3"
                placeholder='{"Weight": "1kg", "Color": "Black"}'
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inStock" className="text-right">
                In Stock
              </Label>
              <Checkbox
                id="inStock"
                name="inStock"
                defaultChecked={currentProduct ? currentProduct.in_stock === 1 : true}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">{currentProduct ? "Save Changes" : "Add Product"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmModalOpen} onOpenChange={setIsDeleteConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to delete this product? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
