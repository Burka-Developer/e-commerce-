"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Edit, Trash, Upload } from "lucide-react"
import Image from "next/image"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Tag, TrendingUp, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/client-api"

type Category = { id: number; name: string; description?: string | null; image?: string | null; is_active?: 0 | 1 }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<(Category & { productCount: number })[]>([])
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<(Category & { productCount: number }) | null>(null)
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [{ categories }, { products }] = await Promise.all([
        apiGet<{ categories: Category[] }>("/api/categories"),
        apiGet<{ products: Array<{ id: number; category_id: number | null }> }>("/api/products"),
      ])
      const counts = new Map<number, number>()
      for (const p of products) {
        if (p.category_id) counts.set(p.category_id, (counts.get(p.category_id) || 0) + 1)
      }
      const merged = categories.map((c) => ({ ...c, productCount: counts.get(c.id) || 0 }))
      setCategories(merged)
    } catch {
      toast({ title: "Failed to load categories", variant: "destructive" })
    }
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddEditCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get("name") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const image = String(formData.get("image") || "").trim()
    const isActive = formData.get("isActive") === "on"

    const body = { name, description, image, isActive }
    try {
      if (currentCategory) {
        await apiPatch(`/api/categories/${currentCategory.id}`, body)
        toast({ title: "Category updated" })
      } else {
        await apiPost("/api/categories", body)
        toast({ title: "Category added" })
      }
      setIsAddEditModalOpen(false)
      setCurrentCategory(null)
      await loadData()
    } catch (err) {
      toast({ title: "Failed to save category", variant: "destructive" })
    }
  }

  const openAddModal = () => {
    setCurrentCategory(null)
    setIsAddEditModalOpen(true)
  }

  const openEditModal = (category: Category & { productCount: number }) => {
    setCurrentCategory(category)
    setIsAddEditModalOpen(true)
  }

  const openDeleteConfirmModal = (id: number) => {
    const category = categories.find((c) => c.id === id)
    if (category && category.productCount > 0) {
      toast({
        title: "Cannot Delete Category",
        description: `Category "${category.name}" has ${category.productCount} products. Please reassign or delete products first.`,
        variant: "destructive",
      })
      return
    }
    setCategoryToDelete(id)
    setIsDeleteConfirmModalOpen(true)
  }

  const handleDeleteCategory = async () => {
    if (categoryToDelete !== null) {
      try {
        await apiDelete(`/api/categories/${categoryToDelete}`)
        setIsDeleteConfirmModalOpen(false)
        setCategoryToDelete(null)
        toast({ title: "Category deleted" })
        await loadData()
      } catch (e: any) {
        toast({ title: "Failed to delete", description: "Reassign or remove products first.", variant: "destructive" })
      }
    }
  }

  const stats = {
    total: categories.length,
    active: categories.filter((c) => (c.is_active ?? 1) === 1).length,
    inactive: categories.filter((c) => (c.is_active ?? 1) === 0).length,
    totalProducts: categories.reduce((sum, c) => sum + c.productCount, 0),
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
                <h1 className="text-3xl font-bold">Categories</h1>
                <p className="text-muted-foreground">Manage your product categories</p>
              </div>
              <Button onClick={openAddModal}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                  <Tag className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <div className="relative w-full aspect-[4/3] bg-muted">
                    {category.image?.startsWith("/") ? (
                      <Image src={category.image} alt={category.name} fill className="object-cover" />
                    ) : category.image ? (
                      // Fallback to native img for remote URLs (avoids Next Image domain config)
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <Image src="/products/item1.jpg" alt={category.name} fill className="object-cover" />
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg flex-1">{category.name}</h3>
                      <Badge variant={category.is_active === 0 ? "secondary" : "default"}>
                        {category.is_active === 0 ? "Inactive" : "Active"}
                      </Badge>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{category.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{category.productCount} products</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteConfirmModal(category.id)}
                          disabled={category.productCount > 0}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredCategories.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                  <p className="text-muted-foreground">Try adjusting your search</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Category Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{currentCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEditCategory} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" defaultValue={currentCategory?.name || ""} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={currentCategory?.description || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <div className="col-span-3 space-y-2">
                <Input id="image" name="image" defaultValue={currentCategory?.image || ""} placeholder="/categories/....webp" />
                <div className="flex items-center gap-2">
                  <Input id="cat-file" type="file" accept="image/*" className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploading}
                    onClick={async () => {
                      try {
                        const input = document.getElementById("cat-file") as HTMLInputElement | null
                        if (!input || !input.files || !input.files[0]) {
                          toast({ title: "Select a file first", variant: "destructive" })
                          return
                        }
                        const file = input.files[0]
                        const maxBytes = 5 * 1024 * 1024
                        if (file.size > maxBytes) {
                          toast({ title: "File too large", description: "Max 5MB", variant: "destructive" })
                          return
                        }
                        const allowed = [
                          "image/png",
                          "image/jpeg",
                          "image/jpg",
                          "image/webp",
                          "image/gif",
                          "image/svg+xml",
                        ]
                        if (!allowed.includes(file.type)) {
                          toast({ title: "Unsupported file type", description: "Use PNG, JPG, WEBP, GIF or SVG", variant: "destructive" })
                          return
                        }
                        setIsUploading(true)
                        const fd = new FormData()
                        fd.append("file", file)
                        const res = await fetch("/api/categories/upload", { method: "POST", body: fd })
                        const data = await res.json().catch(() => ({}))
                        if (!res.ok) {
                          const reason = data?.error || `${res.status} ${res.statusText}`
                          toast({ title: "Upload failed", description: reason, variant: "destructive" })
                          return
                        }
                        const url = data?.url
                        const imageEl = document.getElementById("image") as HTMLInputElement
                        if (url && imageEl) {
                          imageEl.value = url
                          toast({ title: "Image uploaded", description: "Saved as WebP", variant: "default" })
                        } else {
                          toast({ title: "Upload failed", description: "No URL returned", variant: "destructive" })
                        }
                      } catch (e: any) {
                        toast({ title: "Upload failed", description: String(e?.message || e), variant: "destructive" })
                      } finally {
                        setIsUploading(false)
                      }
                    }}
                  >
                    <Upload className={`h-4 w-4 mr-2 ${isUploading ? "animate-pulse" : ""}`} />
                    {isUploading ? "Uploading…" : "Upload"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Active
              </Label>
              <Checkbox
                id="isActive"
                name="isActive"
                defaultChecked={currentCategory ? (currentCategory.is_active ?? 1) === 1 : true}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">{currentCategory ? "Save Changes" : "Add Category"}</Button>
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
          <div className="py-4">Are you sure you want to delete this category? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
