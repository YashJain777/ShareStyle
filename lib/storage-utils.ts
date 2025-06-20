// Helper functions for working with localStorage

// Clothes
export interface ClothingItem {
  id: string
  storeId: string
  storeName: string
  storeLocation: string
  name: string
  description: string
  category: string
  gender: "male" | "female" | "kids" | "unisex"
  price: number
  securityDeposit?: number
  minDays: number
  maxDays: number
  images: string[]
  createdAt: number
  isBestseller?: boolean
}

export const getClothes = (): ClothingItem[] => {
  const clothesData = localStorage.getItem("clothes")
  return clothesData ? JSON.parse(clothesData) : []
}

export const getClothingItem = (id: string): ClothingItem | undefined => {
  const clothes = getClothes()
  return clothes.find((item) => item.id === id)
}

export const getStoreClothes = (storeId: string): ClothingItem[] => {
  const clothes = getClothes()
  return clothes.filter((item) => item.storeId === storeId)
}

// Get bestseller clothes
export const getBestsellerClothes = (): ClothingItem[] => {
  const clothes = getClothes()

  // First, check for items explicitly marked as bestsellers
  const explicitBestsellers = clothes.filter((item) => item.isBestseller)

  if (explicitBestsellers.length > 0) {
    return explicitBestsellers
  }

  // If no explicit bestsellers, use the most recently added items
  return [...clothes].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6)
}

export const addClothingItem = (item: ClothingItem): void => {
  const clothes = getClothes()
  clothes.push(item)
  localStorage.setItem("clothes", JSON.stringify(clothes))
  // Trigger storage event for components to update
  window.dispatchEvent(new Event("storage"))
}

export const updateClothingItem = (item: ClothingItem): void => {
  const clothes = getClothes()
  const index = clothes.findIndex((i) => i.id === item.id)
  if (index !== -1) {
    clothes[index] = item
    localStorage.setItem("clothes", JSON.stringify(clothes))
    // Trigger storage event for components to update
    window.dispatchEvent(new Event("storage"))
  }
}

// Mark an item as a bestseller
export const markAsBestseller = (id: string, isBestseller = true): void => {
  const clothes = getClothes()
  const index = clothes.findIndex((item) => item.id === id)

  if (index !== -1) {
    clothes[index] = {
      ...clothes[index],
      isBestseller,
    }
    localStorage.setItem("clothes", JSON.stringify(clothes))
    // Trigger storage event for components to update
    window.dispatchEvent(new Event("storage"))
  }
}

export const deleteClothingItem = (id: string): void => {
  const clothes = getClothes()
  const filteredClothes = clothes.filter((item) => item.id !== id)
  localStorage.setItem("clothes", JSON.stringify(filteredClothes))
  // Trigger storage event for components to update
  window.dispatchEvent(new Event("storage"))
}

// Cart
export interface CartItem {
  id: string
  clothingId: string
  days: number
  addedAt: number
}

export const getCart = (userId: string): CartItem[] => {
  const cartData = localStorage.getItem("cart")
  if (!cartData) return []

  const cart = JSON.parse(cartData)
  return cart[userId] || []
}

export const addToCart = (userId: string, item: CartItem): void => {
  const cartData = localStorage.getItem("cart")
  const cart = cartData ? JSON.parse(cartData) : {}

  if (!cart[userId]) {
    cart[userId] = []
  }

  // Check if item already exists in cart
  const existingIndex = cart[userId].findIndex((i: CartItem) => i.clothingId === item.clothingId)

  if (existingIndex !== -1) {
    // Update existing item
    cart[userId][existingIndex] = item
  } else {
    // Add new item
    cart[userId].push(item)
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  // Trigger storage event for components to update
  window.dispatchEvent(new Event("storage"))
}

export const removeFromCart = (userId: string, itemId: string): void => {
  const cartData = localStorage.getItem("cart")
  if (!cartData) return

  const cart = JSON.parse(cartData)
  if (!cart[userId]) return

  cart[userId] = cart[userId].filter((item: CartItem) => item.id !== itemId)
  localStorage.setItem("cart", JSON.stringify(cart))
  // Trigger storage event for components to update
  window.dispatchEvent(new Event("storage"))
}

export const clearCart = (userId: string): void => {
  const cartData = localStorage.getItem("cart")
  if (!cartData) return

  const cart = JSON.parse(cartData)
  cart[userId] = []
  localStorage.setItem("cart", JSON.stringify(cart))
  // Trigger storage event for components to update
  window.dispatchEvent(new Event("storage"))
}

// Wishlist
export interface WishlistItem {
  id: string
  clothingId: string
  addedAt: number
}

export const getWishlist = (userId: string): WishlistItem[] => {
  const wishlistData = localStorage.getItem("wishlist")
  if (!wishlistData) return []

  const wishlist = JSON.parse(wishlistData)
  return wishlist[userId] || []
}

export const addToWishlist = (userId: string, clothingId: string): void => {
  const wishlistData = localStorage.getItem("wishlist")
  const wishlist = wishlistData ? JSON.parse(wishlistData) : {}

  if (!wishlist[userId]) {
    wishlist[userId] = []
  }

  // Check if item already exists in wishlist
  const existingItem = wishlist[userId].find((item: WishlistItem) => item.clothingId === clothingId)

  if (!existingItem) {
    // Add new item
    wishlist[userId].push({
      id: Date.now().toString(),
      clothingId,
      addedAt: Date.now(),
    })

    localStorage.setItem("wishlist", JSON.stringify(wishlist))
    // Trigger storage event for components to update
    window.dispatchEvent(new Event("storage"))
  }
}

export const removeFromWishlist = (userId: string, itemId: string): void => {
  const wishlistData = localStorage.getItem("wishlist")
  if (!wishlistData) return

  const wishlist = JSON.parse(wishlistData)
  if (!wishlist[userId]) return

  wishlist[userId] = wishlist[userId].filter((item: WishlistItem) => item.id !== itemId)
  localStorage.setItem("wishlist", JSON.stringify(wishlist))
  // Trigger storage event for components to update
  window.dispatchEvent(new Event("storage"))
}

// Orders
export interface Order {
  id: string
  userId: string
  userName: string
  items: {
    clothingId: string
    clothingName: string
    storeId: string
    storeName: string
    price: number
    days: number
    total: number
    pickupDate: string
    returnDate: string
  }[]
  total: number
  status: "pending" | "completed" | "cancelled"
  createdAt: number
}

export const getOrders = (): Order[] => {
  const ordersData = localStorage.getItem("orders")
  return ordersData ? JSON.parse(ordersData) : []
}

export const getUserOrders = (userId: string): Order[] => {
  const orders = getOrders()
  return orders.filter((order) => order.userId === userId)
}

export const getStoreOrders = (storeId: string): Order[] => {
  const orders = getOrders()
  return orders.filter((order) => order.items.some((item) => item.storeId === storeId))
}

export const addOrder = (order: Order): void => {
  const orders = getOrders()
  orders.push(order)
  localStorage.setItem("orders", JSON.stringify(orders))
  // Trigger storage event for components to update
  window.dispatchEvent(new Event("storage"))
}

export const updateOrderStatus = (orderId: string, status: "pending" | "completed" | "cancelled"): void => {
  const orders = getOrders()
  const index = orders.findIndex((order) => order.id === orderId)
  if (index !== -1) {
    orders[index].status = status
    localStorage.setItem("orders", JSON.stringify(orders))
    // Trigger storage event for components to update
    window.dispatchEvent(new Event("storage"))
  }
}

export const deleteOrder = (orderId: string): void => {
  const orders = getOrders()
  const filteredOrders = orders.filter((order) => order.id !== orderId)
  localStorage.setItem("orders", JSON.stringify(filteredOrders))
  // Trigger storage event for components to update
  window.dispatchEvent(new Event("storage"))
}
