"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  getWishlist,
  getClothingItem,
  removeFromWishlist,
  addToCart,
  type WishlistItem,
  type ClothingItem,
} from "@/lib/storage-utils"

interface WishlistItemWithDetails extends WishlistItem {
  clothing: ClothingItem
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithDetails[]>([])
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

    // Load wishlist items from localStorage
    const loadWishlist = () => {
      if (user) {
        const userWishlist = getWishlist(user.id)

        // Get clothing details for each wishlist item
        const wishlistWithDetails = userWishlist
          .map((item) => {
            const clothing = getClothingItem(item.clothingId)
            if (!clothing) return null

            return {
              ...item,
              clothing,
            }
          })
          .filter(Boolean) as WishlistItemWithDetails[]

        setWishlistItems(wishlistWithDetails)
      }
    }

    loadWishlist()

    // Listen for storage events to update wishlist
    window.addEventListener("storage", loadWishlist)
    return () => window.removeEventListener("storage", loadWishlist)
  }, [user, router])

  const handleRemoveItem = (id: string) => {
    if (user) {
      removeFromWishlist(user.id, id)
      toast({
        description: "Item removed from wishlist",
      })
    }
  }

  const handleAddToCart = (item: WishlistItemWithDetails) => {
    if (!user) return

    addToCart(user.id, {
      id: Date.now().toString(),
      clothingId: item.clothingId,
      days: item.clothing.minDays,
      addedAt: Date.now(),
    })

    toast({
      title: "Added to cart",
      description: `${item.clothing.name} added to your cart`,
    })

    // Optionally remove from wishlist
    removeFromWishlist(user.id, item.id)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save items you love to your wishlist and rent them later.</p>
          <Link href="/browse">
            <Button>Browse Clothes</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden h-full flex flex-col">
              <div className="aspect-square relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white/90 h-8 w-8 rounded-full"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Remove from wishlist</span>
                </Button>
                <img
                  src={item.clothing.images[0] || "/placeholder.svg?height=300&width=300"}
                  alt={item.clothing.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardContent className="p-4 flex-grow">
                <h3 className="font-semibold text-lg line-clamp-1">{item.clothing.name}</h3>
                <p className="text-xl font-bold mt-1">₹{item.clothing.price}/day</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.clothing.description}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleAddToCart(item)}>
                  Add to Cart
                </Button>
                <Link href={`/clothes/${item.clothing.id}`} className="flex-1">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
