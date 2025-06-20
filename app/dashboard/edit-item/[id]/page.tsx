"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getClothingItem, updateClothingItem } from "@/lib/storage-utils"

export default function EditItemPage() {
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [gender, setGender] = useState("unisex")
  const [price, setPrice] = useState("")
  const [securityDeposit, setSecurityDeposit] = useState("")
  const [minDays, setMinDays] = useState("1")
  const [maxDays, setMaxDays] = useState("7")
  const [originalItem, setOriginalItem] = useState<any>(null)

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
      return
    }

    // Load item data
    if (params.id) {
      const item = getClothingItem(params.id as string)
      if (item) {
        if (item.storeId !== user.id) {
          // Not the owner of this item
          router.push("/dashboard")
          return
        }

        setOriginalItem(item)
        setName(item.name)
        setDescription(item.description || "")
        setCategory(item.category || "")
        setGender(item.gender || "unisex")
        setPrice(item.price.toString())
        setSecurityDeposit((item.securityDeposit || 0).toString())
        setMinDays(item.minDays.toString())
        setMaxDays(item.maxDays.toString())
        setImages(item.images || [])
      } else {
        router.push("/dashboard")
      }
    }
  }, [params.id, user, router])

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

    if (!user || !originalItem) {
      toast({
        title: "Error",
        description: "You must be logged in to edit items",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Update clothing item
      const updatedItem = {
        ...originalItem,
        name,
        description,
        category,
        gender,
        price: Number.parseFloat(price),
        securityDeposit: Number.parseFloat(securityDeposit || "0"),
        minDays: Number.parseInt(minDays),
        maxDays: Number.parseInt(maxDays),
        images,
        updatedAt: Date.now(),
      }

      // Update in localStorage
      updateClothingItem(updatedItem)

      toast({
        title: "Item updated successfully",
        description: "Your clothing item has been updated",
      })

      router.push("/dashboard")
    } catch (err) {
      toast({
        title: "Error updating item",
        description: "There was a problem updating your item",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!originalItem) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Clothing Item</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Update information about the clothing item</CardDescription>
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
                    <SelectItem value="male">Men</SelectItem>
                    <SelectItem value="female">Women</SelectItem>
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
              <Label>Current Images</Label>
              {images.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Preview ${index}`}
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Upload Additional Images</Label>
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
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Item...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
