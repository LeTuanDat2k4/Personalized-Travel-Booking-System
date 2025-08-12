"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { formatDistanceToNow } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface WishlistGridProps {
  items: any[]
}

export function WishlistGrid({ items }: WishlistGridProps) {
  const { removeFromWishlist } = useWishlist()
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = useCallback(
    async (accommodationId: string) => {
      setIsRemoving(true)
      try {
        await removeFromWishlist(accommodationId)
      } finally {
        setIsRemoving(false)
        setItemToRemove(null)
      }
    },
    [removeFromWishlist],
  )

  const formatDate = (dateArray: number[]) => {
    if (!dateArray || dateArray.length < 3) return ""
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray
    return new Date(year, month - 1, day, hour, minute, second)
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => {
          const accommodationId = item.accommodation.accommodationId.toString()
          const createdDate = formatDate(item.createdAt)

          return (
            <Card key={accommodationId} className="overflow-hidden group">
              <div className="relative">
                <Link href={`/property/${accommodationId}`}>
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={item.accommodation.photoUrl || "/placeholder.svg?height=300&width=400"}
                      alt={item.accommodation.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 hover:text-red-500 rounded-full z-10"
                  onClick={() => setItemToRemove(accommodationId)}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Remove from wishlist</span>
                </Button>
              </div>

              <CardContent className="p-4">
                <Link href={`/property/${accommodationId}`}>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{item.accommodation.type.charAt(0) + item.accommodation.type.slice(1).toLowerCase()}</span>
                    </div>

                    <h3 className="font-medium text-base line-clamp-1">{item.accommodation.name}</h3>

                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <span className="font-bold text-base">${item.accommodation.pricePerNight}</span>
                        <span className="text-gray-500 text-xs"> /night</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {createdDate ? `Added ${formatDistanceToNow(createdDate, { addSuffix: true })}` : ""}
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!itemToRemove} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from wishlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this property from your wishlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToRemove && handleRemove(itemToRemove)} disabled={isRemoving}>
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
