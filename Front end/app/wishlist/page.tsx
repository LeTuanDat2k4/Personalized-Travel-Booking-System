"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { WishlistGrid } from "@/components/wishlist/wishlist-grid"
import { WishlistEmpty } from "@/components/wishlist/wishlist-empty"
import { useWishlist } from "@/contexts/wishlist-context"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  )
}

function WishlistContent() {
  const router = useRouter()
  const { wishlistItems, isLoading, error, refreshWishlist, lastFetched } = useWishlist()
  const [activeTab, setActiveTab] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Only refresh if data is stale or hasn't been fetched yet
  useEffect(() => {
    // If data hasn't been fetched yet or is very old, refresh it
    if (!lastFetched) {
      handleRefresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshWishlist()
    setIsRefreshing(false)
  }

  // Filter wishlist items based on active tab
  const filteredItems = wishlistItems.filter((item) => {
    if (activeTab === "all") return true
    return item.accommodation.type.toLowerCase() === activeTab.toLowerCase()
  })

  // Get unique property types for tabs
  const propertyTypes = Array.from(new Set(wishlistItems.map((item) => item.accommodation.type.toLowerCase())))

  if (isLoading && !isRefreshing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full max-w-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {wishlistItems.length === 0 ? (
        <WishlistEmpty />
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({wishlistItems.length})</TabsTrigger>
              {propertyTypes.map((type) => {
                const count = wishlistItems.filter((item) => item.accommodation.type.toLowerCase() === type).length
                return (
                  <TabsTrigger key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <WishlistGrid items={filteredItems} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
