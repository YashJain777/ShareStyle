import { CheckCircle, Search, ShoppingBag, Upload } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="h-10 w-10 text-rose-500" />,
      title: "Store Owners Upload",
      description: "Local store owners upload their clothes with details, pricing, and rental duration.",
      forOwners: true,
    },
    {
      icon: <Search className="h-10 w-10 text-teal-500" />,
      title: "Browse & Select",
      description: "Browse through a variety of clothes from local stores and select what you like.",
      forOwners: false,
    },
    {
      icon: <ShoppingBag className="h-10 w-10 text-amber-500" />,
      title: "Rent & Pickup",
      description: "Rent clothes for your desired duration and pick them up from the local store.",
      forOwners: false,
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-emerald-500" />,
      title: "Return & Review",
      description: "Return the clothes after your rental period and leave a review for the store.",
      forOwners: false,
    },
  ]

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform connects local clothing stores with customers looking to rent stylish pieces
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full p-3 bg-gray-100">{step.icon}</div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-gray-500">{step.description}</p>
              {step.forOwners && (
                <span className="text-xs font-medium bg-rose-100 text-rose-800 px-2 py-1 rounded-full">
                  For Store Owners
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
