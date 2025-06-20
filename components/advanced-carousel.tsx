"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getClothes, type ClothingItem } from "@/lib/storage-utils"

interface AdvancedCarouselProps {
  title: string
  className?: string
  autoPlay?: boolean
  interval?: number
  renderItem: (item: ClothingItem, index: number) => React.ReactNode
}

export default function AdvancedCarousel({
  title,
  className,
  autoPlay = true,
  interval = 5000,
  renderItem,
}: AdvancedCarouselProps) {
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTouching, setIsTouching] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Load clothes from localStorage
  useEffect(() => {
    const loadClothes = () => {
      setIsLoading(true)
      const allClothes = getClothes()

      // Sort by createdAt (newest first) to simulate "bestsellers"
      const sortedClothes = [...allClothes].sort((a, b) => b.createdAt - a.createdAt)

      setClothes(sortedClothes)
      setIsLoading(false)
    }

    loadClothes()

    // Listen for storage events to update clothes
    window.addEventListener("storage", loadClothes)
    return () => window.removeEventListener("storage", loadClothes)
  }, [])

  const totalSlides = Math.max(clothes.length, 1)
  const slidesToShow = Math.min(3, totalSlides)
  const maxIndex = Math.max(0, totalSlides - slidesToShow)

  // Next slide moves from right to left (standard carousel direction)
  const nextSlide = () => {
    if (isAnimating || clothes.length <= slidesToShow) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1))
    setTimeout(() => setIsAnimating(false), 500) // Match transition duration
  }

  // Previous slide moves from left to right
  const prevSlide = () => {
    if (isAnimating || clothes.length <= slidesToShow) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1))
    setTimeout(() => setIsAnimating(false), 500) // Match transition duration
  }

  // Auto-advance the carousel
  useEffect(() => {
    if (!autoPlay || clothes.length <= slidesToShow) return

    const startAutoPlay = () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
      autoPlayRef.current = setInterval(() => {
        if (!isTouching) nextSlide()
      }, interval)
    }

    startAutoPlay()

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [autoPlay, interval, clothes.length, slidesToShow, isTouching])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setIsTouching(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    setIsTouching(false)
    if (touchStart - touchEnd > 100) {
      // Swipe left
      nextSlide()
    }
    if (touchStart - touchEnd < -100) {
      // Swipe right
      prevSlide()
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
    <div className={cn("relative", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            disabled={clothes.length <= slidesToShow}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={clothes.length <= slidesToShow}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>

      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={carouselRef}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)` }}
        >
          {clothes.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`w-full sm:w-1/2 lg:w-1/3 p-2 flex-shrink-0`}
              style={{ minWidth: `${100 / slidesToShow}%` }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots for mobile */}
      <div className="flex justify-center mt-4 md:hidden">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${index === currentIndex ? "bg-primary" : "bg-gray-300"}`}
            onClick={() => {
              setCurrentIndex(index)
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
