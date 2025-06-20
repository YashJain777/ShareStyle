"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DollarSign, Package, Plus, ShoppingBag, Star, Users, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/components/auth-provider"
import { getStoreClothes, getStoreOrders, markAsBestseller } from "@/lib/storage-utils"
import { deleteOrder } from "@/lib/order-utils"
import { toast } from "sonner"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [clothes, setClothes] = useState([])
  const [orders, setOrders] = useState([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in or not a shop owner
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "shop") {
      router.push("/")
      return
    }

    // Load store's clothes and orders
    const loadData = () => {
      if (user) {
        const storeClothes = getStoreClothes(user.id)
        setClothes(storeClothes)

        const storeOrders = getStoreOrders(user.id)
        setOrders(storeOrders)
      }
    }

    loadData()

    // Listen for storage events to update data
    window.addEventListener("storage", loadData)
    return () => window.removeEventListener("storage", loadData)
  }, [user, router])

  // Handle toggling bestseller status
  const handleToggleBestseller = (id, isBestseller) => {
    markAsBestseller(id, isBestseller)
  }

  // Add this function after the handleToggleBestseller function
  const handleDeleteOrder = (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      deleteOrder(orderId)
      toast({
        title: "Order deleted",
        description: "The order has been deleted successfully",
      })
    }
  }

  // Calculate stats
  const activeOrders = orders.filter((order) => order.status === "pending").length
  const totalRevenue = orders.reduce((sum, order) => {
    // Sum only this store's items
    const storeItems = order.items.filter((item) => item.storeId === user?.id)
    return sum + storeItems.reduce((itemSum, item) => itemSum + item.total, 0)
  }, 0)

  const uniqueCustomers = [...new Set(orders.map((order) => order.userId))].length

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Store Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/add-item">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </Link>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">From all completed rentals</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeOrders}</div>
                <p className="text-xs text-muted-foreground">Pending rentals</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clothes.length}</div>
                <p className="text-xs text-muted-foreground">Items in your inventory</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueCustomers}</div>
                <p className="text-xs text-muted-foreground">Unique customers</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>You have {activeOrders} active orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No orders yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                          <TableCell>{order.userName}</TableCell>
                          <TableCell>{order.items.filter((item) => item.storeId === user?.id).length}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                order.status === "pending"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            ₹
                            {order.items
                              .filter((item) => item.storeId === user?.id)
                              .reduce((sum, item) => sum + item.total, 0)
                              .toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Inventory Overview</CardTitle>
                <CardDescription>Your clothing items</CardDescription>
              </CardHeader>
              <CardContent>
                {clothes.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">You haven't added any clothes yet.</p>
                    <Link href="/dashboard/add-item">
                      <Button>Add Your First Item</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clothes.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="w-10 h-10 rounded-md overflow-hidden mr-3">
                          <img
                            src={item.images[0] || "/placeholder.svg?height=40&width=40"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {item.name}
                            {item.isBestseller && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                                Bestseller
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">₹{item.price}/day</p>
                        </div>
                      </div>
                    ))}
                    {clothes.length > 3 && (
                      <Link
                        href="/dashboard?tab=inventory"
                        className="text-sm text-primary hover:underline block text-center mt-4"
                      >
                        View all {clothes.length} items
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Manage all your rental orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No orders yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{order.userName}</TableCell>
                        <TableCell>{order.items.filter((item) => item.storeId === user?.id).length}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              order.status === "pending"
                                ? "bg-green-100 text-green-800"
                                : order.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          ₹
                          {order.items
                            .filter((item) => item.storeId === user?.id)
                            .reduce((sum, item) => sum + item.total, 0)
                            .toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Order</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium">Your Clothing Inventory</h3>
            <Link href="/dashboard/add-item">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Item
              </Button>
            </Link>
          </div>
          {clothes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No items in your inventory</h3>
                <p className="text-muted-foreground mb-6">Start by adding your first clothing item for rent.</p>
                <Link href="/dashboard/add-item">
                  <Button>Add Your First Item</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clothes.map((item) => (
                <Card key={item.id}>
                  <div className="aspect-square relative">
                    {item.isBestseller && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                          Bestseller
                        </span>
                      </div>
                    )}
                    <img
                      src={item.images[0] || "/placeholder.svg?height=300&width=300"}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-xl font-bold mt-1">${item.price}/day</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-muted-foreground">
                        {item.minDays}-{item.maxDays} days rental
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant={item.isBestseller ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleBestseller(item.id, !item.isBestseller)}
                        >
                          {item.isBestseller ? "Remove Bestseller" : "Mark as Bestseller"}
                        </Button>
                        <Link href={`/dashboard/edit-item/${item.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
