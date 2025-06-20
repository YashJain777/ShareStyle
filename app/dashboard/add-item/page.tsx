"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { addClothingItem } from "@/lib/storage-utils"

export default function AddItemPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [gender, setGender] = useState("unisex")
  const [price, setPrice] = useState("")
  const [minDays, setMinDays] = useState("1")
  const [maxDays, setMaxDays] = useState("7")
  const [securityDeposit, setSecurityDeposit] = useState("")

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect if not logged in or not a shop owner
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "shop") {
      router.push("/")
    }
  }, [user, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      const promises = fileArray.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string)
            }
          }
          reader.readAsDataURL(file)
        })
      })

      Promise.all(promises).then((base64Images) => {
        setImages([...images, ...base64Images])
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add items",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create new clothing item
      const newItem = {
        id: Date.now().toString(),
        storeId: user.id,
        storeName: user.name,
        storeLocation: "Local Area", // This would come from user profile in a real app
        name,
        description,
        category,
        gender, // Add this line
        price: Number.parseFloat(price),
        securityDeposit: Number.parseFloat(securityDeposit || "0"),
        minDays: Number.parseInt(minDays),
        maxDays: Number.parseInt(maxDays),
        images,
        createdAt: Date.now(),
      }

      // Add to localStorage
      addClothingItem(newItem)

      toast({
        title: "Item added successfully",
        description: "Your clothing item has been added to your inventory",
      })

      router.push("/dashboard")
    } catch (err) {
      toast({
        title: "Error adding item",
        description: "There was a problem adding your item",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Add New Clothing Item</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Add information about the clothing item you want to rent out</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Floral Summer Dress"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dresses">Dresses</SelectItem>
                    <SelectItem value="formal">Formal Wear</SelectItem>
                    <SelectItem value="outerwear">Outerwear</SelectItem>
                    <SelectItem value="casual">Casual Wear</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Men's</SelectItem>
                    <SelectItem value="female">Women's</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the item, including size, color, material, condition, etc."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="daily-price">Daily Rental Price (₹)</Label>
                <Input
                  id="daily-price"
                  type="number"
                  min="100"
                  step="50"
                  placeholder="1200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="security-deposit">Security Deposit (₹)</Label>
                <Input
                  id="security-deposit"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="2000"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-days">Minimum Rental Days</Label>
                <Input
                  id="min-days"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={minDays}
                  onChange={(e) => setMinDays(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-days">Maximum Rental Days</Label>
                <Input
                  id="max-days"
                  type="number"
                  min="1"
                  placeholder="14"
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Upload Images</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Label htmlFor="images" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-muted-foreground">Drag and drop images here or click to browse</span>
                </Label>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Preview ${index}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Item...
                </>
              ) : (
                "Add Item to Inventory"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
