import logging
import os
from urllib.parse import quote_plus

import requests
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from rest_framework import status
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

# Prefer a dedicated backend token name but also accept the dev token var used by Next
MAPBOX_TOKEN = os.getenv("MAPBOX_ACCESS_TOKEN") or os.getenv("MAPBOX_DEV_ACCESS_TOKEN")


class MapboxGeocodeView(APIView):
    """Mirror the Next.js `/api/mapbox/geocode` handler.

    Returns JSON shaped like the frontend expects:
      - success: { ok: true, result: { longitude, latitude, placeName } }
      - error: { ok: false, message: string }
    """

    def get(self, request):
        postcode = (request.GET.get("postcode") or "").strip()
        if not postcode:
            return JsonResponse(
                {"ok": False, "message": "Postcode query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = None

        # Try Mapbox first when token available
        if MAPBOX_TOKEN:
            try:
                geocode_url = (
                    "https://api.mapbox.com/geocoding/v5/mapbox.places/"
                    f"{quote_plus(postcode)}.json"
                )
                params = {
                    "country": "gb",
                    "types": "postcode,place,locality,neighborhood",
                    "bbox": "-8.82,49.79,1.92,60.94",
                    "limit": 1,
                    "access_token": MAPBOX_TOKEN,
                }
                resp = requests.get(geocode_url, params=params, timeout=10)
                if resp.ok:
                    payload = resp.json()
                    feature = (payload.get("features") or [None])[0]
                    if feature:
                        center = feature.get("center") or []
                        longitude = center[0] if len(center) > 0 else None
                        latitude = center[1] if len(center) > 1 else None
                        place_name = feature.get("place_name") or postcode
                        if isinstance(longitude, (int, float)) and isinstance(
                            latitude, (int, float)
                        ):
                            result = {
                                "longitude": longitude,
                                "latitude": latitude,
                                "placeName": place_name,
                            }
            except Exception:
                result = None

        # Fallback to postcodes.io
        if not result:
            try:
                resp = requests.get(
                    f"https://api.postcodes.io/postcodes/{quote_plus(postcode)}",
                    timeout=10,
                )
                if resp.ok:
                    payload = resp.json()
                    res = payload.get("result") or {}
                    longitude = res.get("longitude")
                    latitude = res.get("latitude")
                    if isinstance(longitude, (int, float)) and isinstance(
                        latitude, (int, float)
                    ):
                        place_parts = [res.get("admin_district"), res.get("region")]
                        place_name = (
                            ", ".join([p for p in place_parts if p])
                            or res.get("postcode")
                            or postcode
                        )
                        result = {
                            "longitude": longitude,
                            "latitude": latitude,
                            "placeName": place_name,
                        }
            except Exception:
                result = None

        if not result:
            return JsonResponse(
                {
                    "ok": False,
                    "message": "Could not find coordinates for this postcode.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        response = JsonResponse(
            {"ok": True, "result": result}, status=status.HTTP_200_OK
        )
        response["Cache-Control"] = (
            "public, s-maxage=86400, stale-while-revalidate=3600"
        )
        return response


class MapboxStaticView(APIView):
    """Mirror the Next.js `/api/mapbox/static` handler.

    Behaviour:
      - If no token: return a fallback SVG (UK overview or marker preview)
      - If token: request Mapbox Static Images API and stream the PNG back
      - On upstream failure: return fallback SVG
    """

    def get(self, request):
        lng = request.GET.get("lng")
        lat = request.GET.get("lat")
        zoom_q = request.GET.get("zoom")
        style_preset = request.GET.get("style")

        # Next route uses a fixed center/zoom fallback for UK overview
        UK_CENTER = {"lng": -2.5, "lat": 54.8, "zoom": 13}

        def get_style_id(preset: str | None) -> str:
            if preset == "muted":
                return "light-v11"
            if preset == "night":
                return "dark-v11"
            return "streets-v12"

        def build_fallback_svg(has_marker: bool) -> str:
            marker_text = (
                "Marker preview available" if has_marker else "UK overview fallback"
            )
            return (
                '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" '
                'viewBox="0 0 1280 720" role="img" '
                'aria-label="Fallback map image">'
                '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
                '<stop offset="0%" stop-color="#e2e8f0"/>'
                '<stop offset="100%" stop-color="#cbd5e1"/>'
                "</linearGradient></defs>"
                '<rect width="1280" height="720" fill="url(#bg)"/>'
                '<g fill="none" stroke="#94a3b8" stroke-width="1.5" opacity="0.6">'
                '<path d="M80 120h1120"/>'
                '<path d="M80 220h1120"/>'
                '<path d="M80 320h1120"/>'
                '<path d="M80 420h1120"/>'
                '<path d="M80 520h1120"/>'
                '<path d="M80 620h1120"/>'
                '<path d="M180 80v560"/>'
                '<path d="M360 80v560"/>'
                '<path d="M540 80v560"/>'
                '<path d="M720 80v560"/>'
                '<path d="M900 80v560"/>'
                '<path d="M1080 80v560"/>'
                "</g>"
                '<circle cx="640" cy="360" r="14" fill="#1d4ed8" opacity="0.9"/>'
                '<circle cx="640" cy="360" r="34" fill="#1d4ed8" opacity="0.2"/>'
                f'<text x="640" y="660" text-anchor="middle" '
                'font-family="Arial, sans-serif" font-size="28" fill="#334155">'
                "Map unavailable right now - using fallback preview"
                "</text>"
                f'<text x="640" y="695" text-anchor="middle" '
                'font-family="Arial, sans-serif" font-size="20" fill="#475569">'
                f"{marker_text}</text></svg>"
            )

        has_marker = bool(lng and lat)

        # parse numeric center/zoom
        try:
            center_lng = float(lng) if lng is not None else UK_CENTER["lng"]
            center_lat = float(lat) if lat is not None else UK_CENTER["lat"]
        except ValueError:
            return JsonResponse(
                {"ok": False, "message": "invalid lng/lat values"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            zoom = float(zoom_q) if zoom_q is not None else UK_CENTER["zoom"]
        except ValueError:
            zoom = UK_CENTER["zoom"]

        style_id = get_style_id(style_preset)

        # If no token is configured, return fallback svg
        if not MAPBOX_TOKEN:
            svg = build_fallback_svg(has_marker)
            response = HttpResponse(svg, status=200, content_type="image/svg+xml")
            response["Cache-Control"] = "public, s-maxage=300"
            return response

        # Build Mapbox static image URL (match frontend: fixed size 1280x720@2x)
        marker_overlay = (
            f"pin-s+1d4ed8({center_lng:.5f},{center_lat:.5f})/" if has_marker else ""
        )
        static_map_url = (
            f"https://api.mapbox.com/styles/v1/mapbox/{style_id}/static/"
            f"{marker_overlay}{center_lng:.5f},{center_lat:.5f},"
            f"{zoom:.2f},0/1280x720@2x"
        )
        params = {
            "access_token": MAPBOX_TOKEN,
            "logo": "false",
            "attribution": "false",
        }

        try:
            resp = requests.get(static_map_url, params=params, timeout=15, stream=True)
        except requests.RequestException as e:
            logger.exception("Mapbox static request failed: %s", e)
            svg = build_fallback_svg(has_marker)
            response = HttpResponse(svg, status=200, content_type="image/svg+xml")
            response["Cache-Control"] = "public, s-maxage=300"
            return response

        if not resp.ok:
            # log and return fallback svg for upstream errors
            text_preview = ""
            try:
                text_preview = resp.text
            except Exception:
                text_preview = "<unable to decode>"

            logger.warning(
                "Mapbox static upstream failed: %s %s",
                resp.status_code,
                text_preview[:1000],
            )
            svg = build_fallback_svg(has_marker)
            response = HttpResponse(svg, status=200, content_type="image/svg+xml")
            response["Cache-Control"] = "public, s-maxage=300"
            return response

        # Success: stream the PNG and set cache headers similar to Next.js
        response = StreamingHttpResponse(
            resp.raw,
            status=resp.status_code,
            content_type=resp.headers.get("Content-Type", "image/png"),
        )
        response["Cache-Control"] = (
            "public, s-maxage=86400, stale-while-revalidate=3600"
        )
        return response
