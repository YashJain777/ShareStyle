"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Calendar, CheckCircle, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"
import { getOrders } from "@/lib/storage-utils"

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<any>(null)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Get the most recent order for this user
    const userOrders = getOrders().filter((o) => o.userId === user.id)
    if (userOrders.length > 0) {
      // Sort by createdAt descending and get the first one
      const latestOrder = userOrders.sort((a, b) => b.createdAt - a.createdAt)[0]
      setOrder(latestOrder)
    } else {
      router.push("/browse")
    }
  }, [user, router])

  if (!order) {
    return <div className="container mx-auto py-12 px-4">Loading order details...</div>
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">Thank you for your order. We've sent a confirmation to your email.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Number</span>
            <span className="font-medium">{order.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{order.subtotal?.toFixed(2) || order.total.toFixed(2)}</span>
          </div>
          {order.securityDeposits > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security Deposits (Refundable)</span>
              <span>₹{order.securityDeposits.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Fee</span>
            <span>₹{order.serviceFee?.toFixed(2) || (order.total * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">₹{order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span>Cash on Pickup</span>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">Pickup Information</h2>
      <div className="space-y-4 mb-8">
        {order.items.map((item: any) => (
          <Card key={item.clothingId}>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{item.clothingName}</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    Pickup at: <span className="font-medium">{item.storeName}</span>
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    Pickup: <span className="font-medium">{item.pickupDate}</span>
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    Return by: <span className="font-medium">{item.returnDate}</span>
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 px-4 py-2">
              <div className="text-xs text-muted-foreground">
                Please bring your ID and order number when picking up your items.
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Separator className="my-8" />

      <div className="flex flex-col items-center text-center space-y-4">
        <h2 className="text-xl font-bold">What's Next?</h2>
        <p className="text-muted-foreground max-w-md">
          You can visit the store on your selected pickup date to collect your items. Don't forget to return them on
          time!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/browse">
            <Button>
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
