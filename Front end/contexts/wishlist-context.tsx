"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import ApiService from "@/lib/ApiService"
import { toast } from "@/components/ui/use-toast"

type WishlistItem = {
  id: string | null
  accommodation: {
    accommodationId: number
    name: string
    description: string
    type: string
    pricePerNight: number
    photoUrl: string
  }
  createdAt: number[]
}

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  isLoading: boolean
  error: string | null
  addToWishlist: (accommodationId: string) => Promise<void>
  removeFromWishlist: (accommodationId: string) => Promise<void>
  isInWishlist: (accommodationId: string) => boolean
  refreshWishlist: () => Promise<void>
  lastFetched: number | null
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

// Time threshold for refetching (5 minutes in milliseconds)
const REFETCH_THRESHOLD = 5 * 60 * 1000

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<number | null>(null)

  // Use a ref to track if a fetch is in progress to prevent duplicate calls
  const fetchInProgress = useRef(false)

  // Debug logging for development
  const logApiCall = (message: string) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[WishlistContext] ${message}`, new Date().toISOString())
    }
  }

  const fetchWishlist = useCallback(
    async (force = false) => {
      // Don't fetch if not authenticated
      if (!ApiService.isAuthenticated()) {
        setWishlistItems([])
        setIsLoading(false)
        return
      }

      // Don't fetch if a fetch is already in progress
      if (fetchInProgress.current) {
        logApiCall("Fetch already in progress, skipping duplicate call")
        return
      }

      // Don't fetch if data was recently fetched (unless forced)
      const now = Date.now()
      if (!force && lastFetched && now - lastFetched < REFETCH_THRESHOLD) {
        logApiCall(`Using cached data, last fetched ${(now - lastFetched) / 1000}s ago`)
        return
      }

      try {
        logApiCall("Fetching wishlist data")
        fetchInProgress.current = true
        setIsLoading(true)
        setError(null)

        const response = await ApiService.getWishlist()

        if (response.statusCode === 200 && response.data) {
          setWishlistItems(response.data)
          setLastFetched(Date.now())
          logApiCall(`Fetched ${response.data.length} wishlist items`)
        } else {
          setWishlistItems([])
          logApiCall("No wishlist items found or invalid response")
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err)
        setError("Failed to load wishlist. Please try again.")
        setWishlistItems([])
      } finally {
        setIsLoading(false)
        fetchInProgress.current = false
      }
    },
    [lastFetched],
  )

  // Initial fetch on mount only if authenticated
  useEffect(() => {
    if (ApiService.isAuthenticated()) {
      fetchWishlist()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addToWishlist = async (accommodationId: string) => {
    if (!ApiService.isAuthenticated()) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await ApiService.addToWishlist(accommodationId)
      if (response.statusCode === 201) {
        // Optimistic update
        if (response.data && response.data.accommodation) {
          setWishlistItems((prev) => [...prev, response.data])
        }

        toast({
          title: "Added to wishlist",
          description: "Property has been added to your wishlist.",
        })

        // Refresh to ensure data consistency, but don't show loading state
        fetchWishlist(true)
      } else {
        toast({
          title: "Error",
          description: "Failed to add property to wishlist. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err)
      toast({
        title: "Error",
        description: "Failed to add property to wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeFromWishlist = async (accommodationId: string) => {
    if (!ApiService.isAuthenticated()) {
      return
    }

    try {
      // Optimistic update
      setWishlistItems((prev) =>
        prev.filter((item) => item.accommodation.accommodationId.toString() !== accommodationId),
      )

      const response = await ApiService.removeFromWishlist(accommodationId)

      if (response.statusCode === 200) {
        toast({
          title: "Removed from wishlist",
          description: "Property has been removed from your wishlist.",
        })
      } else {
        // Revert optimistic update on error
        fetchWishlist(true)
        toast({
          title: "Error",
          description: "Failed to remove property from wishlist. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      // Revert optimistic update on error
      fetchWishlist(true)
      console.error("Error removing from wishlist:", err)
      toast({
        title: "Error",
        description: "Failed to remove property from wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isInWishlist = useCallback(
    (accommodationId: string) => {
      return wishlistItems.some((item) => item.accommodation.accommodationId.toString() === accommodationId)
    },
    [wishlistItems],
  )

  const refreshWishlist = useCallback(async () => {
    await fetchWishlist(true)
  }, [fetchWishlist])

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist,
        lastFetched,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
