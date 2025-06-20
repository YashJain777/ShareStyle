"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Clock, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getCart, getClothingItem, removeFromCart, type CartItem, type ClothingItem } from "@/lib/storage-utils"

// Extended cart item with clothing details
interface CartItemWithDetails extends CartItem {
  clothing: ClothingItem
  total: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Load cart items from localStorage
    const loadCart = () => {
      if (user) {
        const userCart = getCart(user.id)

        // Get clothing details for each cart item
        const cartWithDetails = userCart
          .map((item) => {
            const clothing = getClothingItem(item.clothingId)
            if (!clothing) return null

            return {
              ...item,
              clothing,
              total: clothing.price * item.days,
            }
          })
          .filter(Boolean) as CartItemWithDetails[]

        setCartItems(cartWithDetails)
      }
    }

    loadCart()

    // Listen for storage events to update cart
    window.addEventListener("storage", loadCart)
    return () => window.removeEventListener("storage", loadCart)
  }, [user, router])

  const updateQuantity = (id: string, change: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          const newDays = Math.max(1, item.days + change)
          return {
            ...item,
            days: newDays,
            total: item.clothing.price * newDays,
          }
        }
        return item
      }),
    )
  }

  const handleRemoveItem = (id: string) => {
    if (user) {
      removeFromCart(user.id, id)
      toast({
        description: "Item removed from cart",
      })
    }
  }

  const subtotal = cartItems.reduce((total, item) => total + item.total, 0)
  const securityDeposits = cartItems.reduce((total, item) => total + (item.clothing.securityDeposit || 0), 0)
  const serviceFee = Math.round(subtotal * 0.1)
  const total = subtotal + serviceFee + securityDeposits

  const handleCheckout = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/checkout")
    }, 1000)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/browse">
            <Button>Browse Clothes</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.clothing.images[0] || "/placeholder.svg?height=100&width=100"}
                        alt={item.clothing.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <h3 className="font-semibold truncate">{item.clothing.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.clothing.storeName}, {item.clothing.storeLocation}
                          </p>
                          <p className="font-medium mt-1">₹{item.clothing.price}/day</p>
                          {item.clothing.securityDeposit > 0 && (
                            <p className="text-xs text-muted-foreground">
                              + ₹{item.clothing.securityDeposit} refundable security deposit
                            </p>
                          )}
                        </div>
                        <div className="flex items-center mt-2 sm:mt-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.days <= 1}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease</span>
                          </Button>
                          <div className="flex items-center mx-2">
                            <span className="w-8 text-center">{item.days}</span>
                            <span className="text-xs text-muted-foreground ml-1">days</span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.days >= item.clothing.maxDays}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase</span>
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{item.days} day rental</span>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                          <p className="font-semibold ml-4">₹{item.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              <CardFooter>
                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
