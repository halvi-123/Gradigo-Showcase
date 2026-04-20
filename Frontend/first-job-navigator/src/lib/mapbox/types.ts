export type MapboxGeocodeResult = {
  longitude: number
  latitude: number
  placeName: string
}

export type MapboxGeocodeSuccessResponse = {
  ok: true
  result: MapboxGeocodeResult
}

export type MapboxGeocodeErrorResponse = {
  ok: false
  message: string
}

export type MapboxGeocodeResponse =
  | MapboxGeocodeSuccessResponse
  | MapboxGeocodeErrorResponse

export type CrimeOverlayViewModel = {
  label: string
  opacity: number
  color: string
}

export type AffordabilityOverlayViewModel = {
  label: string
  opacity: number
  color: string
}
