"use client"

import { useState, useEffect, useMemo } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Search, Eye, Edit, Package, DollarSign, ShoppingCart } from "lucide-react"
import Image from "next/image"

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800"
    case "shipped":
      return "bg-blue-100 text-blue-800"
    case "processing":
      return "bg-yellow-100 text-yellow-800"
    case "pending":
      return "bg-orange-100 text-orange-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "failed":
      return "bg-red-100 text-red-800"
    case "refunded":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

type AdminOrder = {
  id: string
  idNum: number
  customerId: number
  customerName: string
  customerEmail: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  items: Array<{ id: number; name: string; price: number; quantity: number; image?: string | null }>
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  } | null
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  tracking?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const { toast } = useToast()

  // Form state for editing
  const [editForm, setEditForm] = useState({
    status: "",
    tracking: "",
    notes: "",
  })

  useEffect(() => {
    const controller = new AbortController()
    const fetchOrders = async () => {
      setIsFetching(true)
      try {
        const params = new URLSearchParams()
        if (searchTerm.trim()) params.set("q", searchTerm.trim())
        if (statusFilter !== "all") params.set("status", statusFilter)
        if (paymentFilter !== "all") params.set("paymentStatus", paymentFilter)
        params.set("pageSize", "50")
        const res = await fetch(`/api/admin/orders?${params.toString()}`, { signal: controller.signal })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || "Failed to load orders")
        setOrders(data.data || [])
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          toast({ title: "Failed to load orders", description: e?.message || String(e), variant: "destructive" })
        }
      } finally {
        setIsFetching(false)
      }
    }
    fetchOrders()
    return () => controller.abort()
  }, [searchTerm, statusFilter, paymentFilter, toast])

  const filteredOrders = useMemo(() => orders, [orders])

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return

    setIsLoading(true)

    try {
      const idNum = selectedOrder.idNum
      const res = await fetch(`/api/admin/orders/${idNum}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editForm.status, tracking: editForm.tracking, notes: editForm.notes }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to update order")

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.idNum === idNum ? { ...o, status: editForm.status as AdminOrder["status"], tracking: editForm.tracking } : o)),
      )
      setIsEditDialogOpen(false)
      setSelectedOrder(null)
      toast({ title: "Order Updated", description: "Order has been successfully updated" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openViewDialog = (order: AdminOrder) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const openEditDialog = (order: AdminOrder) => {
    setSelectedOrder(order)
    setEditForm({
      status: order.status,
      tracking: order.tracking || "",
      notes: order.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const processingOrders = orders.filter((o) => o.status === "processing").length
  const completedOrders = orders.filter((o) => o.status === "delivered").length

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
                <h1 className="text-3xl font-bold">Orders</h1>
                <p className="text-muted-foreground">Manage customer orders</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Processing</p>
                      <p className="text-2xl font-bold">{processingOrders}</p>
                    </div>
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{completedOrders}</p>
                    </div>
                    <div className="h-3 w-3 bg-green-500 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders, customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Orders ({filteredOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[920px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden md:table-cell">Items</TableHead>
                        <TableHead className="whitespace-nowrap">Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Payment</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="align-top whitespace-nowrap">
                            <div className="font-medium">{order.id}</div>
                            {order.tracking && (
                              <div className="text-xs text-muted-foreground font-mono">{order.tracking}</div>
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell align-top">
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-2">
                                {order.items.slice(0, 3).map((item, index) => (
                                  <Image
                                    key={index}
                                    src={item.image || "/products/item1.jpg"}
                                    alt={item.name}
                                    width={24}
                                    height={24}
                                    className="rounded-full border-2 border-background object-cover"
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {order.items.length} item{order.items.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="align-top whitespace-nowrap">
                            <div className="font-medium">${order.total.toFixed(2)}</div>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell align-top">
                            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell align-top">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openViewDialog(order)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(order)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>Complete order information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong> {selectedOrder.customerName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.customerEmail}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Order Status</h4>
                  <div className="space-y-2">
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-semibold mb-2">Shipping Address</h4>
                {selectedOrder.shippingAddress ? (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                    </p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No shipping address available</p>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t font-semibold">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment & Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Payment Method</h4>
                  <p className="text-sm">{selectedOrder.paymentMethod}</p>
                </div>
                {selectedOrder.tracking && (
                  <div>
                    <h4 className="font-semibold mb-2">Tracking Number</h4>
                    <p className="text-sm font-mono">{selectedOrder.tracking}</p>
                  </div>
                )}
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg w-[95vw]">
          <DialogHeader>
            <DialogTitle>Edit Order - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>Update order status and tracking information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={editForm.tracking}
                onChange={(e) => setEditForm({ ...editForm, tracking: e.target.value })}
                placeholder="Enter tracking number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Add order notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
