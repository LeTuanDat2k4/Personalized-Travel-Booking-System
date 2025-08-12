"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ApiService from "@/lib/ApiService"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsAuthenticated(ApiService.isAuthenticated())
    setIsAdmin(ApiService.isAdmin())
  }, [pathname])

  const handleLogout = () => {
    ApiService.logout()
    setIsAuthenticated(false)
    setIsAdmin(false)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Travel Booking
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <ul className="navbar-ul flex space-x-4">
              <li>
                <NavLink href="/" active={pathname === "/"}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink href="/properties" active={pathname === "/properties"}>
                  Properties
                </NavLink>
              </li>
              <li>
                <NavLink href="/find-booking" active={pathname === "/find-booking"}>
                  Find my Booking
                </NavLink>
              </li>
              {isAuthenticated && (
                <li>
                  <NavLink href="/profile" active={pathname === "/profile"}>
                    Profile
                  </NavLink>
                </li>
              )}
              {isAdmin && (
                <li>
                  <NavLink href="/admin" active={pathname === "/admin"}>
                    Admin
                  </NavLink>
                </li>
              )}
            </ul>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink href="/" active={pathname === "/"} onClick={toggleMobileMenu}>
              Home
            </MobileNavLink>
            <MobileNavLink href="/properties" active={pathname === "/properties"} onClick={toggleMobileMenu}>
              Properties
            </MobileNavLink>
            <MobileNavLink href="/find-booking" active={pathname === "/find-booking"} onClick={toggleMobileMenu}>
              Find my Booking
            </MobileNavLink>
            {isAuthenticated && (
              <MobileNavLink href="/profile" active={pathname === "/profile"} onClick={toggleMobileMenu}>
                Profile
              </MobileNavLink>
            )}
            {isAdmin && (
              <MobileNavLink href="/admin" active={pathname === "/admin"} onClick={toggleMobileMenu}>
                Admin
              </MobileNavLink>
            )}
            {isAuthenticated ? (
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <>
                <MobileNavLink href="/auth/login" active={pathname === "/auth/login"} onClick={toggleMobileMenu}>
                  Login
                </MobileNavLink>
                <MobileNavLink href="/auth/register" active={pathname === "/auth/register"} onClick={toggleMobileMenu}>
                  Register
                </MobileNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

interface NavLinkProps {
  href: string
  active: boolean
  children: React.ReactNode
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        active ? "text-primary font-bold active" : "text-gray-700 hover:text-primary"
      }`}
    >
      {children}
    </Link>
  )
}

interface MobileNavLinkProps {
  href: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function MobileNavLink({ href, active, onClick, children }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        active ? "text-primary font-bold active" : "text-gray-700 hover:text-primary"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}
