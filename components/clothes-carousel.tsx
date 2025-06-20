"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getClothes, type ClothingItem } from "@/lib/storage-utils"

interface ClothesCarouselProps {
  title: string
}

export default function ClothesCarousel({ title }: ClothesCarouselProps) {
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Load clothes from localStorage
  useEffect(() => {
    const loadClothes = () => {
      setIsLoading(true)
      const allClothes = getClothes()

      // Sort by createdAt (newest first)
      const sortedClothes = [...allClothes].sort((a, b) => b.createdAt - a.createdAt)

      setClothes(sortedClothes)
      setIsLoading(false)
    }

    loadClothes()

    // Listen for storage events to update clothes
    window.addEventListener("storage", loadClothes)
    return () => window.removeEventListener("storage", loadClothes)
  }, [])

  // Check if we can scroll left or right
  useEffect(() => {
    const checkScroll = () => {
      if (!containerRef.current) return

      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", checkScroll)
      // Initial check
      checkScroll()

      return () => container.removeEventListener("scroll", checkScroll)
    }
  }, [clothes, isLoading])

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of the visible width

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

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

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Scroll Left</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Scroll Right</span>
          </Button>
        </div>
      </div>

      {/* Horizontal scrolling container */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {clothes.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex-shrink-0 w-[280px] md:w-[320px] snap-start">
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

      {/* Gradient overlays to indicate more content */}
      {canScrollLeft && (
        <div className="absolute left-0 top-[3.5rem] bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-[3.5rem] bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      )}
    </div>
  )
}
