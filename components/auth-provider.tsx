"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: number
  name: string
  email: string
  role: "user" | "admin"
  avatar?: string
  phone?: string | null
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string,
    adminToken?: string,
  ) => Promise<{ pending: boolean; email?: string }>
  signInWithGoogle: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        const data = await res.json()
        setUser(data.user)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    bootstrap()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      setIsLoading(false)
      throw new Error("Invalid credentials")
    }
    const data = await res.json()
    setUser(data.user)
    setIsLoading(false)
  }

  // Sign in with Google using OAuth 2.0 popup flow
  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        setIsLoading(false)
        throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable")
      }

      // Open Google OAuth popup directly using OAuth 2.0 authorization endpoint
      const redirectUri = `${window.location.origin}/api/auth/callback/google`
      const scope = "openid profile email"

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scope,
        prompt: "select_account",
      })

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      
      // Open in popup window
      const popup = window.open(authUrl, "googleAuth", "width=500,height=600")
      if (!popup) {
        setIsLoading(false)
        throw new Error("Popup blocked. Please allow popups for this site.")
      }

      // Listen for callback message from popup
      return new Promise<void>((resolve, reject) => {
        const handleMessage = async (event: MessageEvent) => {
          console.log('Message received:', event.data, 'Origin:', event.origin)
          
          // Accept from same origin OR allow for development with protocol flexibility
          if (event.origin !== window.location.origin && !window.location.hostname.includes('localhost')) {
            console.warn('Origin mismatch:', event.origin, 'vs', window.location.origin)
            return
          }
          
          if (event.data.type === "google_auth_success") {
            try {
              const { id_token } = event.data
              console.log('Received id_token, calling /api/auth/google...')
              
              if (!id_token) {
                throw new Error("No ID token in response")
              }

              // Exchange ID token with our backend
              const r = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token }),
              })

              console.log('API response status:', r.status)
              
              if (!r.ok) {
                const error = await r.json()
                console.error('Backend error details:', error)
                throw new Error(error.error || error.details || "Google sign-in failed")
              }

              const data = await r.json()
              console.log('User created/logged in:', data.user)
              
              setUser(data.user)
              setIsLoading(false)
              window.removeEventListener("message", handleMessage)
              clearTimeout(timeout)
              
              // Give a tiny delay before closing popup to ensure everything is set
              setTimeout(() => {
                popup?.close()
              }, 100)
              
              resolve()
            } catch (e: any) {
              console.error("Google auth error:", e)
              setIsLoading(false)
              window.removeEventListener("message", handleMessage)
              clearTimeout(timeout)
              reject(e)
            }
          } else if (event.data.type === "google_auth_error") {
            console.error('Google auth error from popup:', event.data.error)
            setIsLoading(false)
            window.removeEventListener("message", handleMessage)
            clearTimeout(timeout)
            reject(new Error(event.data.error || "Google authentication failed"))
          }
        }

        window.addEventListener("message", handleMessage)
        console.log('Message listener registered')

        // Timeout after 5 minutes
        const timeout = setTimeout(() => {
          console.error('Google sign-in timeout')
          setIsLoading(false)
          window.removeEventListener("message", handleMessage)
          reject(new Error("Google sign-in timeout"))
        }, 300000)
      })
    } catch (error: any) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }

  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    adminToken?: string,
  ) => {
    setIsLoading(true)
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, adminToken }),
    })
    const data = await res.json()
    setIsLoading(false)
    if (!res.ok) {
      // If API signals pending with error (e.g., email send fail), still return pending so UI can navigate
      if (data && data.pending) return { pending: true, email }
      throw new Error(data?.error || "Signup failed")
    }
    if (data.user) {
      setUser(data.user)
      return { pending: false, email: data.user.email }
    }
    // New flow: pending verification
    return { pending: true, email: data.email || email }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, signInWithGoogle, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
