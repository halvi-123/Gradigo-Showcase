import { act, renderHook } from "@testing-library/react"

import { useMoveOutReadinessPropertyListings } from "@/hooks/use-move-out-readiness-property-listings"

jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: jest.fn(),
}))

const { useIsMobile } = jest.requireMock("@/hooks/use-mobile") as {
  useIsMobile: jest.Mock<boolean, []>
}

function createListings(count: number) {
  return Array.from({ length: count }).map((_, index) => ({
    listingId: `listing-${index + 1}`,
    displayAddress: `Address ${index + 1}`,
    latestPrice: 1000 + index,
    displayPrice: null,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: "Flat",
    propertySubType: null,
    agent: "Agent",
    agentBranch: null,
    addedDate: null,
    imageUrl: null,
    listingUrl: null,
    source: null,
  }))
}

describe("useMoveOutReadinessPropertyListings", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useIsMobile.mockReturnValue(false)
  })

  it("uses desktop paging defaults", () => {
    const listings = createListings(7)
    const { result } = renderHook(() =>
      useMoveOutReadinessPropertyListings({ listings }),
    )

    expect(result.current.isMobile).toBe(false)
    expect(result.current.pageSize).toBe(6)
    expect(result.current.totalPages).toBe(2)
    expect(result.current.visibleListings).toHaveLength(6)
  })

  it("clamps pagination at page bounds", () => {
    const listings = createListings(7)
    const { result } = renderHook(() =>
      useMoveOutReadinessPropertyListings({ listings }),
    )

    act(() => {
      result.current.goToNextPage()
    })

    expect(result.current.currentPage).toBe(1)
    expect(result.current.visibleListings).toHaveLength(1)

    act(() => {
      result.current.goToNextPage()
      result.current.goToNextPage()
    })

    expect(result.current.currentPage).toBe(1)

    act(() => {
      result.current.goToPreviousPage()
      result.current.goToPreviousPage()
    })

    expect(result.current.currentPage).toBe(0)
  })

  it("supports mobile expand and collapse behavior", () => {
    useIsMobile.mockReturnValue(true)
    const listings = createListings(4)

    const { result } = renderHook(() =>
      useMoveOutReadinessPropertyListings({ listings }),
    )

    expect(result.current.isMobile).toBe(true)
    expect(result.current.pageSize).toBe(3)
    expect(result.current.isExpanded).toBe(false)
    expect(result.current.canShowListings).toBe(false)

    act(() => {
      result.current.expandListings()
    })

    expect(result.current.isExpanded).toBe(true)
    expect(result.current.canShowListings).toBe(true)

    act(() => {
      result.current.collapseListings()
    })

    expect(result.current.isExpanded).toBe(false)
    expect(result.current.canShowListings).toBe(false)
  })
})
