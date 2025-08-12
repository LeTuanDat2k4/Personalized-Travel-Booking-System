import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { Toaster } from "@/components/ui/toaster"
import { PreferencesProvider } from "@/contexts/preferences-context"
import { WishlistProvider } from "@/contexts/wishlist-context"
import "./globals.css"
import "./leaflet.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Travel Booking Platform",
  description: "Find and book your perfect accommodation with personalized recommendations",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <PreferencesProvider>
            <WishlistProvider>
              <div className="min-h-screen bg-background">
                <SiteHeader />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </WishlistProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
