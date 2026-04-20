"use client"

import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, ImageOffIcon, SparklesIcon, BedDoubleIcon, BathIcon, Building2Icon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { MoveOutPropertyListing } from "@/lib/move-out-readiness/types"
import { useMoveOutReadinessPropertyListings } from "@/hooks/use-move-out-readiness-property-listings"
import { formatListingAddedDate, formatListingPrice, formatListingType } from "@/lib/move-out-readiness/property-listings"

type MoveOutReadinessPropertyListingsProps = {
  listings: MoveOutPropertyListing[]
  isLoading?: boolean
}

export function MoveOutReadinessPropertyListings({
  listings,
  isLoading = false,
}: MoveOutReadinessPropertyListingsProps) {
  const {
    collapseListings,
    currentPage,
    expandListings,
    goToNextPage,
    goToPreviousPage,
    hasListings,
    isExpanded,
    isMobile,
    totalListings,
    totalPages,
    visibleListings,
    pageSize,
  } = useMoveOutReadinessPropertyListings({ listings })

  const startIndex = totalPages === 0 ? 0 : currentPage * pageSize + 1
  const endIndex = totalPages === 0 ? 0 : Math.min((currentPage + 1) * pageSize, totalListings)

  return (
    <Card className="overflow-hidden border-dashed">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HomeIcon className="h-4 w-4" />
              Relevant listings in this area
            </CardTitle>
            <CardDescription>
              We found a couple of listings in your target area based on your selected postcode. These are updated in real-time, so check back regularly to see new listings come in!
            </CardDescription>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[var(--primary)]/15 bg-[var(--primary)]/5 px-3 py-1 text-xs font-medium text-[var(--primary)] md:inline-flex">
            <SparklesIcon className="h-3.5 w-3.5" />
            {totalListings} listings
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-7 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !hasListings ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
            No property listings were returned for this area yet.
          </div>
        ) : isMobile && !isExpanded ? (
          <Button onClick={expandListings} className="h-11 w-full rounded-full bg-[var(--primary)] px-4 text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 sm:w-auto">
            Open listing preview
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="text-muted-foreground">
                Showing {startIndex} - {endIndex} of {totalListings}
              </p>

              {isMobile ? (
                <Button type="button" variant="ghost" className="h-9 px-3 text-sm font-medium text-[var(--primary)]" onClick={collapseListings}>
                  Hide listings
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {visibleListings.map((listing) => (
                <article
                  key={listing.listingId ?? `${listing.displayAddress}-${listing.latestPrice ?? "na"}`}
                  className="group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_12px_28px_-22px_rgba(13,19,33,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-26px_rgba(13,19,33,0.55)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted sm:aspect-[16/9]">
                    {listing.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={listing.imageUrl}
                        alt={listing.displayAddress}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--primary)]/10 via-[var(--chart-4)]/10 to-[var(--chart-3)]/20 text-[var(--primary)]">
                        <ImageOffIcon className="h-8 w-8" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex items-start gap-3 p-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/82 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
                        <Building2Icon className="h-3.5 w-3.5 text-white/90" />
                        {formatListingType(listing)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground sm:text-[1.05rem]">
                          {listing.displayAddress}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          {listing.agent || "Agent unavailable"}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-[var(--chart-4)]/70" />

                        <span className="inline-flex items-center gap-1.5">
                          <BedDoubleIcon className="h-3.5 w-3.5 text-[var(--primary)]" />
                          {typeof listing.bedrooms === "number" ? `${listing.bedrooms} bed${listing.bedrooms === 1 ? "" : "s"}` : "Beds n/a"}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-[var(--chart-4)]/70" />

                        <span className="inline-flex items-center gap-1.5">
                          <BathIcon className="h-3.5 w-3.5 text-[var(--primary)]" />
                          {typeof listing.bathrooms === "number" ? `${listing.bathrooms} bath${listing.bathrooms === 1 ? "" : "s"}` : "Baths n/a"}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[var(--primary)]/12 bg-[linear-gradient(135deg,rgba(30,64,175,0.09),rgba(255,255,255,0.96))] px-4 py-4 shadow-[0_10px_24px_-22px_rgba(13,19,33,0.35)]">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Price</p>
                      <p className="mt-1 text-[2rem] font-semibold tracking-tight text-[var(--primary)] leading-none sm:text-[2.2rem]">
                        {formatListingPrice(listing)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-center text-xs text-muted-foreground sm:text-left">
                        {formatListingAddedDate(listing)}
                      </p>

                      {listing.listingUrl ? (
                        <Button asChild size="sm" className="group h-11 rounded-full bg-[var(--primary)] px-5 text-[var(--primary-foreground)] shadow-sm transition-all hover:bg-[var(--primary)]/90 hover:shadow-md focus-visible:ring-[var(--primary)]/30">
                          <a href={listing.listingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                            View listing
                            <HomeIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" disabled className="h-11 rounded-full bg-muted px-5 text-muted-foreground">
                          No link available
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-3 py-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className="gap-2 border-[var(--primary)]/20 bg-background text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{currentPage + 1}</span> of {totalPages}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className="gap-2 border-[var(--primary)]/20 bg-background text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
