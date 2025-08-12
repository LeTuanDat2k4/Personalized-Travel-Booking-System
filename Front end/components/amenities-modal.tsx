import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { AmenityIcon } from "@/components/amenity-icon"
import { X } from "lucide-react"

interface AmenitiesModalProps {
  amenities: string[]
  propertyName: string
  open: boolean
  onClose: () => void
}

export function AmenitiesModal({ amenities, propertyName, open, onClose }: AmenitiesModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Amenities</DialogTitle>
            <DialogClose className="h-6 w-6 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="divide-y">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-4 py-4">
              <AmenityIcon name={amenity} className="text-gray-500 h-6 w-6" />
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
