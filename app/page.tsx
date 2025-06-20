import ClothesCarousel from "@/components/clothes-carousel"
import AdvertisementCarousel from "@/components/advertisement-carousel"
import CustomerReviews from "@/components/customer-reviews"
import FeaturedShops from "@/components/featured-shops"
import HowItWorks from "@/components/how-it-works"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Advertisement Carousel */}
      <AdvertisementCarousel />

      {/* Featured Collection */}
      <section className="w-full py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <ClothesCarousel title="Featured Collection" />
        </div>
      </section>

      {/* Featured Shops */}
      <FeaturedShops />

      {/* Latest Uploads */}
      <section className="w-full py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <ClothesCarousel title="Latest Uploads" />
        </div>
      </section>

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* How It Works */}
      <HowItWorks />
    </div>
  )
}
