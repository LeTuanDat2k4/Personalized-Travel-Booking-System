import { Suspense } from "react"
import { HostDashboard } from "@/components/host/host-dashboard"

export default function HostDashboardPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading dashboard...</div>}>
          <HostDashboard />
        </Suspense>
      </div>
    </main>
  )
}
