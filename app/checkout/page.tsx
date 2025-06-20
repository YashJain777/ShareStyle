"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, CreditCard, Loader2, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getCart, getClothingItem, clearCart, addOrder } from "@/lib/storage-utils"
import Link from "next/link"

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cartItems, setCartItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [serviceFee, setServiceFee] = useState(0)
  const [total, setTotal] = useState(0)
  const [securityDeposits, setSecurityDeposits] = useState(0)

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Load cart items
    if (user) {
      const userCart = getCart(user.id)

      // Get clothing details for each cart item
      const cartWithDetails = userCart
        .map((item) => {
          const clothing = getClothingItem(item.clothingId)
          if (!clothing) return null

          const itemTotal = clothing.price * item.days

          return {
            ...item,
            clothing,
            total: itemTotal,
          }
        })
        .filter(Boolean)

      setCartItems(cartWithDetails)

      // Calculate totals
      const cartSubtotal = cartWithDetails.reduce((sum, item) => sum + item.total, 0)
      const securityDeposits = cartWithDetails.reduce((sum, item) => sum + (item.clothing.securityDeposit || 0), 0)
      const fee = Math.round(cartSubtotal * 0.1)

      setSubtotal(cartSubtotal)
      setSecurityDeposits(securityDeposits)
      setServiceFee(fee)
      setTotal(cartSubtotal + fee + securityDeposits)
    }
  }, [user, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || cartItems.length === 0) return

    setIsLoading(true)

    try {
      // Create order
      const order = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        items: cartItems.map((item) => ({
          clothingId: item.clothing.id,
          clothingName: item.clothing.name,
          storeId: item.clothing.storeId,
          storeName: item.clothing.storeName,
          price: item.clothing.price,
          securityDeposit: item.clothing.securityDeposit || 0,
          days: item.days,
          total: item.total,
          pickupDate: new Date().toISOString().split("T")[0], // Today
          returnDate: new Date(Date.now() + item.days * 86400000).toISOString().split("T")[0], // Today + days
        })),
        subtotal,
        securityDeposits,
        serviceFee,
        total,
        status: "pending",
        createdAt: Date.now(),
      }

      // Add order to localStorage
      addOrder(order)

      // Clear cart
      clearCart(user.id)

      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly.",
      })

      router.push("/checkout/success")
    } catch (err) {
      toast({
        title: "Error placing order",
        description: "There was a problem processing your order",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (cartItems.length === 0 && user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <p className="mb-4">Your cart is empty. Add some items before checkout.</p>
        <Link href="/browse">
          <Button>Browse Clothes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" defaultValue={user?.name.split(" ")[0]} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue={user?.name.split(" ")[1] || ""} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pickup Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Items will be available for pickup at their respective store locations</span>
                </div>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="border rounded-md p-4">
                      <h3 className="font-medium">{item.clothing.name}</h3>
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          Pickup at: {item.clothing.storeName}, {item.clothing.storeLocation}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Select pickup date:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          Today
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Tomorrow
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Day After
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="card" onValueChange={setPaymentMethod} value={paymentMethod}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="card">Credit Card</TabsTrigger>
                    <TabsTrigger value="cash">Cash on Pickup</TabsTrigger>
                  </TabsList>
                  <TabsContent value="card" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" required />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="name-on-card">Name on Card</Label>
                        <Input id="name-on-card" defaultValue={user?.name} required />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="cash" className="mt-4">
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">
                        Pay in cash when you pick up your items. Please bring the exact amount.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea id="notes" placeholder="Any special instructions or requests?" className="min-h-[100px]" />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </form>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.clothing.name} ({item.days} days × ₹{item.clothing.price}/day)
                  </span>
                  <span>₹{item.total.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Security Deposits (Refundable)</span>
                <span>₹{securityDeposits.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span>₹{serviceFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-center text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 mr-2" />
              <span>Secure payment processing</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
