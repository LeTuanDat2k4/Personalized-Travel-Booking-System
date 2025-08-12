import {
  AirVent,
  Bath,
  Coffee,
  Droplets,
  Dumbbell,
  Flame,
  Key,
  Luggage,
  Microwave,
  Snowflake,
  SpadeIcon as Spa,
  FishIcon as Swim,
  Tv,
  Wifi,
  Wine,
  Waves,
  Umbrella,
  Utensils,
  Briefcase,
  Cigarette,
  ParkingMeterIcon as Parking,
  Shirt,
} from "lucide-react"

type AmenityIconProps = {
  name: string
  className?: string
}

export function AmenityIcon({ name, className = "h-5 w-5" }: AmenityIconProps) {
  // Convert name to lowercase and remove spaces for matching
  const normalizedName = name.toLowerCase().replace(/\s+/g, "-")

  // Map amenity names to icons
  switch (normalizedName) {
    case "wifi":
    case "free-wifi":
      return <Wifi className={className} />
    case "tv":
    case "television":
    case "la-tv":
      return <Tv className={className} />
    case "kitchen":
    case "full-kitchen":
      return <Utensils className={className} />
    case "air-conditioning":
    case "ac":
      return <AirVent className={className} />
    case "heating":
      return <Flame className={className} />
    case "washer":
    case "washing-machine":
      return <Shirt className={className} />
    case "dryer":
      return <Shirt className={className} />
    case "pool":
    case "swimming-pool":
    case "la-swimming-pool":
      return <Swim className={className} />
    case "hot-tub":
    case "jacuzzi":
      return <Waves className={className} />
    case "gym":
    case "fitness-center":
      return <Dumbbell className={className} />
    case "breakfast":
      return <Coffee className={className} />
    case "parking":
    case "free-parking":
      return <Parking className={className} />
    case "microwave":
      return <Microwave className={className} />
    case "coffee-maker":
    case "coffee":
      return <Coffee className={className} />
    case "refrigerator":
    case "fridge":
      return <Snowflake className={className} />
    case "bathtub":
    case "bath":
    case "la-shower":
      return <Bath className={className} />
    case "wine":
    case "bar":
      return <Wine className={className} />
    case "dedicated-workspace":
    case "workspace":
      return <Briefcase className={className} />
    case "la-key":
    case "key":
      return <Key className={className} />
    case "la-luggage-cart":
    case "luggage-cart":
      return <Luggage className={className} />
    case "la-smoking":
    case "smoking":
      return <Cigarette className={className} />
    case "la-snowflake":
    case "snowflake":
      return <Snowflake className={className} />
    case "la-spa":
    case "spa":
      return <Spa className={className} />
    case "la-suitcase":
    case "suitcase":
      return <Briefcase className={className} />
    case "la-suitcase-rolling":
    case "suitcase-rolling":
      return <Luggage className={className} />
    case "la-swimmer":
    case "swimmer":
      return <Swim className={className} />
    case "la-umbrella-beach":
    case "umbrella-beach":
      return <Umbrella className={className} />
    default:
      // For any unmatched amenity, return a generic icon
      return <Droplets className={className} />
  }
}
