import { useCallback, useMemo, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { MoveOutPropertyListing } from "@/lib/move-out-readiness/types"

const MOBILE_PAGE_SIZE = 3
const DESKTOP_PAGE_SIZE = 6

type UseMoveOutReadinessPropertyListingsArgs = {
  listings: MoveOutPropertyListing[]
}

export function useMoveOutReadinessPropertyListings({ listings }: UseMoveOutReadinessPropertyListingsArgs) {
  const isMobile = useIsMobile()
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const pageSize = isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE

  const totalPages = useMemo(() => {
    if (listings.length === 0) {
      return 0
    }

    return Math.ceil(listings.length / pageSize)
  }, [listings.length, pageSize])

  const safeCurrentPage = useMemo(() => {
    if (totalPages === 0) {
      return 0
    }

    return Math.min(currentPage, totalPages - 1)
  }, [currentPage, totalPages])

  const visibleListings = useMemo(() => {
    if (listings.length === 0) {
      return []
    }

    const startIndex = safeCurrentPage * pageSize
    return listings.slice(startIndex, startIndex + pageSize)
  }, [listings, pageSize, safeCurrentPage])

  const canShowListings = !isMobile || isExpanded

  const expandListings = useCallback(() => {
    setIsExpanded(true)
  }, [])

  const collapseListings = useCallback(() => {
    setIsExpanded(false)
  }, [])

  const goToPage = useCallback((nextPage: number) => {
    if (totalPages === 0) {
      setCurrentPage(0)
      return
    }

    const clampedPage = Math.min(Math.max(nextPage, 0), totalPages - 1)
    setCurrentPage(clampedPage)
  }, [totalPages])

  const goToPreviousPage = useCallback(() => {
    goToPage(safeCurrentPage - 1)
  }, [goToPage, safeCurrentPage])

  const goToNextPage = useCallback(() => {
    goToPage(safeCurrentPage + 1)
  }, [goToPage, safeCurrentPage])

  return {
    canShowListings,
    collapseListings,
    currentPage: safeCurrentPage,
    expandListings,
    goToNextPage,
    goToPreviousPage,
    hasListings: listings.length > 0,
    isExpanded,
    isMobile,
    pageSize,
    totalListings: listings.length,
    totalPages,
    visibleListings,
  }
}