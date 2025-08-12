"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreVertical, Star, Trash } from "lucide-react"
import type { Property } from "@/types/property"

interface HostPropertyListProps {
  properties: Property[]
}

export function HostPropertyList({ properties }: HostPropertyListProps) {
  // Handle empty properties array
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">You don't have any properties yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.accommodationId || property.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md overflow-hidden relative">
                    <Image
                      src={property.photoUrl || "/placeholder.svg?height=48&width=48"}
                      alt={property.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{property.name}</div>
                    <div className="text-sm text-muted-foreground">{property.location}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    property.availability
                      ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                      : "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700"
                  }
                >
                  {property.availability ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>${property.pricePerNight}/night</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{property.averageRating || "No ratings"}</span>
                </div>
              </TableCell>
              <TableCell>{property.bookings?.length || 0} total</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
