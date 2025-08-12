"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    // Always show first page
    pageNumbers.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="icon"
        onClick={() => onPageChange(1)}
        className="h-8 w-8"
      >
        1
      </Button>,
    )

    // Calculate range of pages to show
    const startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3)

    // Adjust if we're near the start
    if (startPage > 2) {
      pageNumbers.push(
        <Button key="start-ellipsis" variant="ghost" size="icon" disabled className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>,
      )
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="icon"
          onClick={() => onPageChange(i)}
          className="h-8 w-8"
        >
          {i}
        </Button>,
      )
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push(
        <Button key="end-ellipsis" variant="ghost" size="icon" disabled className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>,
      )
    }

    // Always show last page
    if (totalPages > 1) {
      pageNumbers.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="icon"
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8"
        >
          {totalPages}
        </Button>,
      )
    }

    return pageNumbers
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {renderPageNumbers()}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export const PaginationContent = React.Fragment

export const PaginationItem = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

export const PaginationLink = ({ children }: { children: React.ReactNode }) => {
  return <a>{children}</a>
}

export const PaginationEllipsis = () => {
  return <span>...</span>
}

export const PaginationPrevious = ({ children }: { children: React.ReactNode }) => {
  return <Button>{children}</Button>
}

export const PaginationNext = ({ children }: { children: React.ReactNode }) => {
  return <Button>{children}</Button>
}
