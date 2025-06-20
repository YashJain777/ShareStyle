"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getClothes, type ClothingItem } from "@/lib/storage-utils"

export default function BestsellerCarousel() {
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Load clothes from localStorage
  useEffect(() => {
    const loadClothes = () => {
      setIsLoading(true)
      const allClothes = getClothes()

      // Sort by createdAt (newest first) to simulate "bestsellers"
      // In a real app, you would use actual sales data
      const sortedClothes = [...allClothes].sort((a, b) => b.createdAt - a.createdAt)

      setClothes(sortedClothes)
      setIsLoading(false)
    }

    loadClothes()

    // Listen for storage events to update clothes
    window.addEventListener("storage", loadClothes)
    return () => window.removeEventListener("storage", loadClothes)
  }, [])

  const nextSlide = useCallback(() => {
    if (clothes.length <= 3) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (clothes.length - 2))
  }, [clothes.length])

  const prevSlide = useCallback(() => {
    if (clothes.length <= 3) return
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? clothes.length - 3 : prevIndex - 1))
  }, [clothes.length])

  // Auto-advance the carousel every 5 seconds
  useEffect(() => {
    if (clothes.length <= 3) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [clothes.length, nextSlide])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (clothes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No clothes available yet</h3>
        <p className="text-muted-foreground mb-6">Shop owners haven't uploaded any clothes yet.</p>
      </div>
    )
  }

  // Show 3 items at a time on desktop, 1 on mobile
  const visibleClothes = clothes.slice(currentIndex, currentIndex + 3)

  // If we don't have enough items to fill the carousel, add from the beginning
  while (visibleClothes.length < 3 && clothes.length > 0) {
    visibleClothes.push(clothes[visibleClothes.length % clothes.length])
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-500 fill-yellow-500" />
          Bestsellers
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevSlide} disabled={clothes.length <= 3} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button variant="outline" size="icon" onClick={nextSlide} disabled={clothes.length <= 3} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(0%)` }}>
          {visibleClothes.map((item, index) => (
            <div key={`${item.id}-${index}`} className="w-full sm:w-1/2 lg:w-1/3 p-2 flex-shrink-0">
              <Link href={`/clothes/${item.id}`}>
                <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                  <div className="aspect-square relative">
                    <Badge className="absolute top-2 right-2 z-10">{item.category}</Badge>
                    <img
                      src={item.images[0] || "/placeholder.svg?height=300&width=300"}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                    <p className="text-xl font-bold mt-1">₹{item.price}/day</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.storeName}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
