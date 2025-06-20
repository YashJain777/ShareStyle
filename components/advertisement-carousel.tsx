"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Advertisement {
  id: number
  image: string
  title: string
  description: string
  link: string
}

export default function AdvertisementCarousel() {
  const advertisements: Advertisement[] = [
    {
      id: 1,
      image: "/images/special-offer.png",
      title: "Special Offer",
      description: "Rent now and get up to 30% off on our new fashion collections",
      link: "/browse",
    },
    {
      id: 2,
      image: "/images/suit-discount.png",
      title: "Formal Wear Discount",
      description: "Up to 50% off on premium suits and formal wear",
      link: "/browse?category=formal",
    },
    {
      id: 3,
      image: "/images/pagadi-collection.png",
      title: "New Pagadi Collection",
      description: "Discover our exclusive collection of traditional pagadis",
      link: "/browse?category=accessories",
    },
    {
      id: 4,
      image: "/images/luxury-rental.png",
      title: "Luxury Dress Rentals",
      description: "Turn your closet into cash with our luxury dress rentals",
      link: "/browse?category=luxury",
    },
    {
      id: 5,
      image: "/images/womens-lehenga.png",
      title: "Women's Lehenga Collection",
      description: "Perfect fashion item for a stylish and trendy look",
      link: "/browse?category=women",
    },
    {
      id: 6,
      image: "/images/emergency-fashion.png",
      title: "Last Minute Fashion",
      description: "Emergency fashion rentals for those last-minute events",
      link: "/browse?category=emergency",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? advertisements.length - 1 : prevIndex - 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  useEffect(() => {
    autoPlayRef.current = setInterval(nextSlide, 5000)
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 flex items-center justify-between z-10 px-4">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous slide</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next slide</span>
        </Button>
      </div>

      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {advertisements.map((ad) => (
          <div key={ad.id} className="min-w-full relative">
            <img
              src={ad.image || "/placeholder.svg"}
              alt={ad.title}
              className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{ad.title}</h2>
              <p className="mb-4 max-w-md">{ad.description}</p>
              <Link href={ad.link}>
                <Button className="w-fit">Shop Now</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {advertisements.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-colors ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
