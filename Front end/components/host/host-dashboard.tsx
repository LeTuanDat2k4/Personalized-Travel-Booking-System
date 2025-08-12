"use client"

import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HostDashboard() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <Button onClick={() => router.push("/host/add-property")} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Property
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Total Properties</h2>
          <p className="text-3xl font-bold">25</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Total Bookings</h2>
          <p className="text-3xl font-bold">120</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Average Rating</h2>
          <p className="text-3xl font-bold">4.7</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Bookings</h2>
        {/* Add recent bookings table or list here */}
        <p>No recent bookings to display.</p>
      </div>
    </div>
  )
}
