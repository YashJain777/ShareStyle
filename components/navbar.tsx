"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Heart, Menu, Search, ShoppingCart, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { Input } from "@/components/ui/input"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    // Get cart count from localStorage
    const updateCartCount = () => {
      if (user) {
        const cartData = localStorage.getItem("cart")
        if (cartData) {
          const cart = JSON.parse(cartData)
          const userCart = cart[user.id] || []
          setCartCount(userCart.length)
        }

        // Get wishlist count
        const wishlistData = localStorage.getItem("wishlist")
        if (wishlistData) {
          const wishlist = JSON.parse(wishlistData)
          const userWishlist = wishlist[user.id] || []
          setWishlistCount(userWishlist.length)
        }
      } else {
        setCartCount(0)
        setWishlistCount(0)
      }
    }

    updateCartCount()

    // Listen for storage events to update cart count
    window.addEventListener("storage", updateCartCount)
    return () => window.removeEventListener("storage", updateCartCount)
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Use replace instead of push to ensure the page reloads with new search params
      router.replace(`/browse?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const routes = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
  ]

  // Add dashboard link for shop owners
  if (user && user.role === "shop") {
    routes.push({ href: "/dashboard", label: "Dashboard" })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === route.href ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {route.label}
                  </Link>
                ))}
                {!user ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full" variant="outline">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button className="w-full" variant="outline" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">ShareStyle</span>
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for clothes..."
              className="pl-9 pr-4 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <nav className="hidden lg:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </>
          )}
          <div className="hidden lg:flex items-center gap-2">
            {!user ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {user.name} ({user.role === "shop" ? "Store" : "Customer"})
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            )}
          </div>
          {user && (
            <Link href={user.role === "shop" ? "/dashboard" : "/profile"} className="lg:hidden">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-2">
        <form onSubmit={handleSearch} className="flex w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for clothes..."
              className="pl-9 pr-4 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
    </header>
  )
}
