"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Review {
  id: number
  name: string
  avatar: string
  rating: number
  comment: string
  date: string
  product: string
}

export default function CustomerReviews() {
  const reviews: Review[] = [
    {
      id: 1,
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      comment:
        "I rented a lehenga for my cousin's wedding and it was absolutely stunning! The quality was excellent and I received so many compliments. Will definitely rent again!",
      date: "15 Apr 2023",
      product: "Designer Bridal Lehenga",
    },
    {
      id: 2,
      name: "Rahul Verma",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      comment:
        "Great experience renting a sherwani for my engagement. The fit was perfect and the service was excellent. Saved me a lot of money compared to buying one.",
      date: "23 May 2023",
      product: "Royal Blue Sherwani",
    },
    {
      id: 3,
      name: "Ananya Patel",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      comment:
        "The saree I rented was beautiful and arrived in perfect condition. The process was so easy and convenient. I'll never buy expensive outfits for one-time occasions again!",
      date: "7 Jun 2023",
      product: "Silk Embroidered Saree",
    },
    {
      id: 4,
      name: "Vikram Singh",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      comment:
        "Rented a suit for a business conference. The quality was top-notch and the rental process was seamless. Highly recommend for professional attire!",
      date: "12 Jul 2023",
      product: "Premium Black Suit",
    },
    {
      id: 5,
      name: "Meera Kapoor",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      comment:
        "The designer dress I rented was perfect for my anniversary dinner. It fit well and looked much more expensive than the rental price. Very satisfied!",
      date: "3 Aug 2023",
      product: "Designer Evening Gown",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const reviewsPerPage = 3
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)

  const nextReviews = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages)
  }

  const prevReviews = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalPages - 1 : prevIndex - 1))
  }

  const visibleReviews = reviews.slice(
    currentIndex * reviewsPerPage,
    Math.min((currentIndex + 1) * reviewsPerPage, reviews.length),
  )

  return (
    <div className="py-12 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl">
            Don't just take our word for it - hear from our satisfied customers who have experienced the convenience and
            quality of our rental service.
          </p>
        </div>

        <div className="relative">
          <div className="flex flex-col md:flex-row gap-6">
            {visibleReviews.map((review) => (
              <Card key={review.id} className="flex-1">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                      <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm mb-3 italic">"{review.comment}"</p>
                  <p className="text-xs text-muted-foreground">Rented: {review.product}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button variant="outline" size="icon" onClick={prevReviews}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous reviews</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`h-2 w-2 rounded-full ${i === currentIndex ? "bg-primary" : "bg-gray-300"}`}
                    onClick={() => setCurrentIndex(i)}
                  />
                ))}
              </div>
              <Button variant="outline" size="icon" onClick={nextReviews}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next reviews</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
