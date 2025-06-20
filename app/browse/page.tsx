"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getClothes, type ClothingItem } from "@/lib/storage-utils"
import ClothingGrid from "@/components/clothing-grid"

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || ""
  const initialCategory = searchParams.get("category") || "all"
  const initialGender = searchParams.get("gender") || "all"

  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [filteredClothes, setFilteredClothes] = useState<ClothingItem[]>([])
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [gender, setGender] = useState(initialGender)
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [rentalDuration, setRentalDuration] = useState("any")

  useEffect(() => {
    // Load clothes from localStorage
    const loadClothes = () => {
      const allClothes = getClothes()
      setClothes(allClothes)
      setFilteredClothes(allClothes)
    }

    loadClothes()

    // Listen for storage events to update clothes
    window.addEventListener("storage", loadClothes)
    return () => window.removeEventListener("storage", loadClothes)
  }, [])

  // Apply initial filters from URL params
  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch)
    }
    if (initialCategory !== "all") {
      setCategory(initialCategory)
    }
    if (initialGender !== "all") {
      setGender(initialGender)
    }

    // Apply filters whenever clothes data changes
    if (clothes.length > 0) {
      applyFilters()
    }
  }, [clothes, initialSearch, initialCategory, initialGender])

  const applyFilters = () => {
    let filtered = clothes

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term),
      )
    }

    // Apply category filter
    if (category !== "all") {
      filtered = filtered.filter((item) => item.category === category)
    }

    // Apply gender filter
    if (gender !== "all") {
      filtered = filtered.filter((item) => item.gender === gender)
    }

    // Apply price filter
    filtered = filtered.filter((item) => item.price >= priceRange[0] && item.price <= priceRange[1])

    // Apply rental duration filter
    if (rentalDuration !== "any") {
      const [min, max] = rentalDuration.split("-").map(Number)
      if (max) {
        filtered = filtered.filter((item) => item.maxDays >= min && item.minDays <= max)
      } else {
        // For "15+" case
        filtered = filtered.filter((item) => item.maxDays >= min)
      }
    }

    setFilteredClothes(filtered)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setCategory("all")
    setGender("all")
    setPriceRange([0, 5000])
    setRentalDuration("any")
    setFilteredClothes(clothes)
  }

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters()
  }, [searchTerm, category, gender, priceRange, rentalDuration])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Rental Clothes</h1>

      <div className="mb-8">
        <Tabs defaultValue={gender} onValueChange={setGender} className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="male">Men</TabsTrigger>
            <TabsTrigger value="female">Women</TabsTrigger>
            <TabsTrigger value="kids">Kids</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Filters</h2>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={resetFilters}>
                Reset
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Category</h3>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="wedding">Wedding Wear</SelectItem>
                    <SelectItem value="formal">Formal Wear</SelectItem>
                    <SelectItem value="traditional">Traditional Wear</SelectItem>
                    <SelectItem value="casual">Casual Wear</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">Price Range (per day)</h3>
                  <span className="text-sm text-muted-foreground">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </span>
                </div>
                <Slider value={priceRange} min={0} max={5000} step={500} onValueChange={setPriceRange} />
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium text-sm">Rental Duration</h3>
                <Select value={rentalDuration} onValueChange={setRentalDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Duration</SelectItem>
                    <SelectItem value="1-3">1-3 days</SelectItem>
                    <SelectItem value="4-7">4-7 days</SelectItem>
                    <SelectItem value="8-14">8-14 days</SelectItem>
                    <SelectItem value="15">15+ days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <Button className="w-full" onClick={applyFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              applyFilters()
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for clothes..."
                className="pl-9 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" className="sr-only">
                Search
              </Button>
            </div>
          </form>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">{filteredClothes.length} items found</h2>
              <p className="text-sm text-muted-foreground">Browse our collection of rental clothes</p>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clothing Grid */}
          <ClothingGrid clothes={filteredClothes} />
        </div>
      </div>
    </div>
  )
}
