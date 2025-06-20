"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Clock, Heart, MapPin, Share2, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getClothingItem, addToCart, addToWishlist, type CartItem } from "@/lib/storage-utils"

export default function ClothingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(0)
  const [rentalDays, setRentalDays] = useState("3")
  const [clothingItem, setClothingItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      const item = getClothingItem(params.id as string)
      if (item) {
        setClothingItem(item)
        // Set rental days to the minimum days for this item
        setRentalDays(item.minDays.toString())
      } else {
        router.push("/browse")
      }
    }
    setLoading(false)
  }, [params.id, router])

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!clothingItem) return

    const cartItem: CartItem = {
      id: Date.now().toString(),
      clothingId: clothingItem.id,
      days: Number.parseInt(rentalDays),
      addedAt: Date.now(),
    }

    addToCart(user.id, cartItem)

    toast({
      title: "Added to cart",
      description: `${clothingItem.name} added to your cart for ${rentalDays} days.`,
    })

    router.push("/cart")
  }

  // Add wishlist functionality to the clothing detail page

  // Add this function to handle adding to wishlist
  const handleAddToWishlist = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!clothingItem) return

    addToWishlist(user.id, clothingItem.id)

    toast({
      title: "Added to wishlist",
      description: `${clothingItem.name} added to your wishlist.`,
    })
  }

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>
  }

  if (!clothingItem) {
    return <div className="container mx-auto py-8 px-4">Item not found</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden border">
            <img
              src={clothingItem.images[selectedImage] || "/placeholder.svg?height=600&width=600"}
              alt={clothingItem.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {clothingItem.images.map((image: string, index: number) => (
              <div
                key={index}
                className={`aspect-square rounded-md overflow-hidden border cursor-pointer ${
                  selectedImage === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image || "/placeholder.svg?height=150&width=150"}
                  alt={`${clothingItem.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <Badge>{clothingItem.category}</Badge>
                <h1 className="text-3xl font-bold mt-2">{clothingItem.name}</h1>
              </div>
              <div className="flex gap-2">
                {/* Update the heart button to use this function */}
                <Button variant="outline" size="icon" onClick={handleAddToWishlist}>
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-3xl font-bold">
              ₹{clothingItem.price} <span className="text-lg font-normal text-muted-foreground">per day</span>
            </p>
            {clothingItem.securityDeposit > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                + ₹{clothingItem.securityDeposit} refundable security deposit
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>
                Available at {clothingItem.storeName}, {clothingItem.storeLocation}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                Rent for{" "}
                {clothingItem.minDays === clothingItem.maxDays
                  ? `${clothingItem.minDays} days`
                  : `${clothingItem.minDays}-${clothingItem.maxDays} days`}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="rental-duration" className="text-sm font-medium">
                Rental Duration
              </label>
              <Select value={rentalDays} onValueChange={setRentalDays}>
                <SelectTrigger id="rental-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: clothingItem.maxDays - clothingItem.minDays + 1 },
                    (_, i) => i + clothingItem.minDays,
                  ).map((days) => (
                    <SelectItem key={days} value={days.toString()}>
                      {days} day{days > 1 ? "s" : ""} (₹{(clothingItem.price * days).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>

          <Tabs defaultValue="description" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="store">Store Info</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-sm text-muted-foreground">{clothingItem.description}</p>
            </TabsContent>
            <TabsContent value="store" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{clothingItem.storeName}</h3>
                      <p className="text-sm text-muted-foreground">{clothingItem.storeLocation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
