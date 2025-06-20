"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  name: string
  email: string
  role: "user" | "shop"
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: "user" | "shop") => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Get users from localStorage
    const usersData = localStorage.getItem("users")
    if (!usersData) return false

    const users = JSON.parse(usersData)

    // Find user with matching email and password
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      // Remove password from user object before storing in state
      const { password, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  const register = async (name: string, email: string, password: string, role: "user" | "shop"): Promise<boolean> => {
    // Get existing users or initialize empty array
    const usersData = localStorage.getItem("users")
    const users = usersData ? JSON.parse(usersData) : []

    // Check if email already exists
    if (users.some((u: any) => u.email === email)) {
      return false
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role,
    }

    // Add to users array
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // Log in the new user
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
