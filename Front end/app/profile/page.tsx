"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import ApiService from "@/lib/ApiService"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import Image from "next/image"
import { UserReviews } from "@/components/reviews/user-reviews"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user profile
        const profileResponse = await ApiService.getUserProfile()

        if (profileResponse.statusCode === 200 && profileResponse.user) {
          setUser(profileResponse.user)

          // Get user bookings
          const bookingsResponse = await ApiService.getUserBookings(profileResponse.user.userId)

          if (bookingsResponse.statusCode === 200 && bookingsResponse.user && bookingsResponse.user.bookings) {
            setBookings(bookingsResponse.user.bookings)
          }
        } else {
          throw new Error("Failed to get user profile")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = () => {
    ApiService.logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const formatPreferenceValue = (type: string, value: string) => {
    if (type === "PRICE") {
      return `$${Number.parseFloat(value).toLocaleString()}`
    }
    return value
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <Tabs defaultValue="personal">
        <TabsList className="mb-8">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="bookings">Booking History</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={user.username} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={user.phoneNumber || ""} readOnly />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => router.push("/bookings")}>
                    View Bookings
                  </Button>
                  <Button
                    onClick={() =>
                      toast({
                        title: "Not implemented",
                        description: "Profile editing is not implemented in this demo.",
                      })
                    }
                  >
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <p>{user.role}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p>{new Date(user.createdAt[0], user.createdAt[1] - 1, user.createdAt[2]).toLocaleDateString()}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    Log Out
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Your Preferences</CardTitle>
              <CardDescription>These preferences help us personalize your recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {user.preferences && user.preferences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.preferences.map((preference: any) => (
                    <Card key={preference.preferenceId}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {preference.preferenceType.charAt(0) + preference.preferenceType.slice(1).toLowerCase()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl font-semibold">
                          {formatPreferenceValue(preference.preferenceType, preference.value)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No preferences set yet.</p>
                  <Button className="mt-4">Set Preferences</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>Your past and upcoming stays</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-6">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative h-48 md:h-full">
                          <Image
                            src={booking.accommodation.photoUrl || "/placeholder.svg?height=300&width=400"}
                            alt={booking.accommodation.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4 md:col-span-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{booking.accommodation.name}</h3>
                              <p className="text-sm text-muted-foreground">{booking.accommodation.location}</p>
                            </div>
                            <Badge variant="outline">{booking.status || "Confirmed"}</Badge>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Check-in</p>
                              <p>
                                {format(
                                  new Date(booking.checkInDate[0], booking.checkInDate[1] - 1, booking.checkInDate[2]),
                                  "MMM d, yyyy",
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Check-out</p>
                              <p>
                                {format(
                                  new Date(
                                    booking.checkOutDate[0],
                                    booking.checkOutDate[1] - 1,
                                    booking.checkOutDate[2],
                                  ),
                                  "MMM d, yyyy",
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground">Booking Code</p>
                            <p className="font-mono">{booking.bookingConfirmationCode}</p>
                          </div>

                          <div className="mt-4 flex justify-between items-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Price</p>
                              <p className="font-bold">${booking.totalPrice.toLocaleString()}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {bookings.length > 5 && (
                    <div className="text-center mt-6">
                      <Button onClick={() => router.push("/bookings")}>View All Bookings</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don't have any bookings yet.</p>
                  <Button className="mt-4" onClick={() => router.push("/properties")}>
                    Find a place to stay
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <UserReviews userId={user.userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
