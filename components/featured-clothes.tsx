import Link from "next/link"
import { Clock, MapPin } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Update the mock data for featured clothes with Indian context
const featuredClothes = [
  {
    id: 1,
    name: "Floral Summer Saree",
    price: 1200,
    image: "/placeholder.svg?height=300&width=300",
    store: "Ethnic Elegance",
    location: "Connaught Place",
    maxDuration: 7,
    category: "Sarees",
  },
  {
    id: 2,
    name: "Wedding Sherwani",
    price: 2500,
    image: "/placeholder.svg?height=300&width=300",
    store: "Royal Attire",
    location: "South Extension",
    maxDuration: 5,
    category: "Formal",
  },
  {
    id: 3,
    name: "Designer Lehenga",
    price: 3000,
    image: "/placeholder.svg?height=300&width=300",
    store: "Bridal Collection",
    location: "Chandni Chowk",
    maxDuration: 10,
    category: "Wedding",
  },
  {
    id: 4,
    name: "Silk Anarkali Suit",
    price: 1800,
    image: "/placeholder.svg?height=300&width=300",
    store: "Fashion Bazaar",
    location: "Lajpat Nagar",
    maxDuration: 3,
    category: "Ethnic",
  },
]

export default function FeaturedClothes() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {featuredClothes.map((item) => (
        <Link href={`/clothes/${item.id}`} key={item.id}>
          <Card className="overflow-hidden h-full transition-all hover:shadow-md">
            <div className="aspect-square relative">
              <Badge className="absolute top-2 right-2 z-10">{item.category}</Badge>
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="object-cover w-full h-full" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
              {/* Update the price display to use ₹ instead of $ */}
              <p className="text-xl font-bold mt-1">₹{item.price}/day</p>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {item.store}, {item.location}
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>Up to {item.maxDuration} days rental</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
