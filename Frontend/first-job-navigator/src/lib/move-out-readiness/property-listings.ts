import type { MoveOutPropertyListing } from "@/lib/move-out-readiness/types"

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
})

export function formatListingPrice(listing: MoveOutPropertyListing) {
  if (typeof listing.latestPrice === "number") {
    return currencyFormatter.format(listing.latestPrice)
  }

  if (listing.displayPrice) {
    return listing.displayPrice
  }

  return "Price on request"
}

export function formatListingMeta(listing: MoveOutPropertyListing) {
  const meta: string[] = []

  if (typeof listing.bedrooms === "number") {
    meta.push(`${listing.bedrooms} bed${listing.bedrooms === 1 ? "" : "s"}`)
  }

  if (typeof listing.bathrooms === "number") {
    meta.push(`${listing.bathrooms} bath${listing.bathrooms === 1 ? "" : "s"}`)
  }

  if (listing.propertyType) {
    meta.push(listing.propertyType)
  }

  return meta
}

export function formatListingType(listing: MoveOutPropertyListing) {
  return listing.propertyType || "Property"
}

export function formatListingSource(listing: MoveOutPropertyListing) {
  return listing.source || "Source unavailable"
}

export function formatListingAddedDate(listing: MoveOutPropertyListing) {
  return listing.addedDate || "Added date unavailable"
}
