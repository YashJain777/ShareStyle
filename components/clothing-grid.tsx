"use client"

import type React from "react"

import Link from "next/link"
import { Clock, Heart, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { addToWishlist, type ClothingItem } from "@/lib/storage-utils"

interface ClothingGridProps {
  clothes: ClothingItem[]
}

export default function ClothingGrid({ clothes }: ClothingGridProps) {
  const { toast } = useToast()
  const { user } = useAuth()

  // Update the handleAddToWishlist function to ensure it works correctly
  const handleAddToWishlist = (e: React.MouseEvent, clothingId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist",
        variant: "destructive",
      })
      return
    }

    // Make sure to call addToWishlist with the correct parameters
    addToWishlist(user.id, clothingId)

    toast({
      title: "Added to wishlist",
      description: "Item has been added to your wishlist",
    })
  }

  if (clothes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No clothes found</h3>
        <p className="text-muted-foreground mb-6">Try adjusting your filters or check back later for new items.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {clothes.map((item) => (
        <Card key={item.id} className="overflow-hidden h-full flex flex-col">
          <div className="aspect-square relative">
            <Badge className="absolute top-2 right-2 z-10">{item.category}</Badge>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 z-10 bg-white/80 hover:bg-white/90 h-8 w-8 rounded-full"
              onClick={(e) => handleAddToWishlist(e, item.id)}
            >
              <Heart className="h-4 w-4" />
              <span className="sr-only">Add to wishlist</span>
            </Button>
            <img
              src={item.images[0] || "/placeholder.svg?height=300&width=300"}
              alt={item.name}
              className="object-cover w-full h-full"
            />
          </div>
          <CardContent className="p-4 flex-grow">
            <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
            <p className="text-xl font-bold mt-1">₹{item.price}/day</p>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate">
                {item.storeName}, {item.storeLocation}
              </span>
            </div>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {item.minDays === item.maxDays
                  ? `${item.minDays} days rental`
                  : `${item.minDays}-${item.maxDays} days rental`}
              </span>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Link href={`/clothes/${item.id}`} className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
