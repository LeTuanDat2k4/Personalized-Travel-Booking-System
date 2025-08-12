import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"
import Link from "next/link"

export function WishlistEmpty() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-gray-100 p-4 mb-4">
          <Heart className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 text-center mb-6 max-w-md">
          Save properties you're interested in by clicking the heart icon on any property card.
        </p>
        <Button asChild>
          <Link href="/properties">Browse Properties</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
