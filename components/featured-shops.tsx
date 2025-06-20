import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Shop {
  id: number
  name: string
  location: string
  image: string
  specialties: string[]
  rating: number
  itemCount: number
}

export default function FeaturedShops() {
  const shops: Shop[] = [
    {
      id: 1,
      name: "Royal Ethnic Collection",
      location: "Connaught Place, Delhi",
      image: "/images/ethnic-wear-display.png",
      specialties: ["Wedding Wear", "Sherwanis", "Turbans"],
      rating: 4.8,
      itemCount: 120,
    },
    {
      id: 2,
      name: "Lehenga Paradise",
      location: "Lajpat Nagar, Delhi",
      image: "/images/womens-lehenga.png",
      specialties: ["Bridal Lehengas", "Designer Sarees", "Indo-Western"],
      rating: 4.7,
      itemCount: 85,
    },
    {
      id: 3,
      name: "Formal Elegance",
      location: "South Extension, Delhi",
      image: "/images/suit-discount.png",
      specialties: ["Suits", "Tuxedos", "Business Attire"],
      rating: 4.9,
      itemCount: 75,
    },
    {
      id: 4,
      name: "Traditional Treasures",
      location: "Chandni Chowk, Delhi",
      image: "/images/pagadi-collection.png",
      specialties: ["Pagadis", "Accessories", "Traditional Wear"],
      rating: 4.6,
      itemCount: 95,
    },
  ]

  return (
    <div className="py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Shops</h2>
          <p className="text-muted-foreground max-w-2xl">
            Discover our curated selection of top-rated shops offering the finest rental clothing options
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img src={shop.image || "/placeholder.svg"} alt={shop.name} className="w-full h-full object-cover" />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{shop.name}</CardTitle>
                <CardDescription>{shop.location}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-1 mb-3">
                  {shop.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between text-sm">
                  <span>⭐ {shop.rating}/5</span>
                  <span>{shop.itemCount} items</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/shops/${shop.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Shop
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
