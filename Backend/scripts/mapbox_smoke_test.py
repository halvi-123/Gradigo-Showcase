#!/usr/bin/env python3
"""
Simple smoke test for the Django Mapbox proxy endpoints.

Usage:
  python mapbox_smoke_test.py --base http://127.0.0.1:8000 --postcode "SW5 0LT"

Requirements: `requests` (already in Backend/requirements.txt)
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Optional

import requests


def run_geocode(base: str, postcode: str) -> Optional[list]:
    url = f"{base.rstrip('/')}/api/mapbox/geocode"
    params = {"postcode": postcode}
    print(f"GET {url} params={params}")

    try:
        r = requests.get(url, params=params, timeout=10)
    except requests.RequestException as e:
        print("Geocode request failed:", e)
        return None

    print("Status:", r.status_code)
    ct = r.headers.get("Content-Type", "")
    print("Content-Type:", ct)

    if r.status_code != 200:
        try:
            print("Body:", r.json())
        except Exception:
            print("Body (raw):", r.text[:400])
        return None

    try:
        data = r.json()
    except Exception as e:
        print("Failed to parse JSON:", e)
        return None

    print("Top-level keys:", list(data.keys()))
    features = data.get("features") or []
    if not features:
        print("No features returned by Mapbox geocode")
        return None

    center = features[0].get("center")
    print("Feature[0].center:", center)
    return center


def run_static(base: str, lng: str, lat: str, zoom: int = 12, width: int = 600, height: int = 300) -> bool:
    url = f"{base.rstrip('/')}/api/mapbox/static"
    params = {"lng": lng, "lat": lat, "zoom": zoom, "width": width, "height": height}
    print(f"GET {url} params={params}")

    try:
        r = requests.get(url, params=params, timeout=20, stream=True)
    except requests.RequestException as e:
        print("Static request failed:", e)
        return False

    print("Status:", r.status_code)
    ct = r.headers.get("Content-Type", "")
    print("Content-Type:", ct)
    length = r.headers.get("Content-Length")
    print("Content-Length:", length)

    if r.status_code != 200:
        try:
            print("Body:", r.json())
        except Exception:
            print("Body (raw):", r.text[:400])
        return False

    # Save image if we appear to have an image content-type
    if ct.startswith("image/"):
        out = os.path.join(os.path.dirname(__file__), "mapbox_static.png")
        print("Saving image to", out)
        try:
            with open(out, "wb") as fh:
                for chunk in r.iter_content(1024):
                    if chunk:
                        fh.write(chunk)
        except Exception as e:
            print("Failed to write image:", e)
            return False
        print("Image saved OK")
        return True

    print("Response not an image; raw body preview:", r.text[:400])
    return True


def main() -> int:
    p = argparse.ArgumentParser(description="Mapbox proxy smoke test")
    p.add_argument("--base", default="http://127.0.0.1:8000", help="Base URL for Django server")
    p.add_argument("--postcode", default="SW5 0LT", help="Postcode to geocode")
    p.add_argument("--no-static", action="store_true", help="Skip static image test")
    args = p.parse_args()

    base = args.base
    postcode = args.postcode

    center = run_geocode(base, postcode)
    if center is None:
        print("Geocode proxy did not return coordinates — failing smoke test")
        return 2

    # center is [lon, lat]
    if not args.no_static:
        try:
            lon, lat = center[0], center[1]
        except Exception:
            print("Invalid center returned, falling back to central London coords")
            lon, lat = -0.118092, 51.509865

        ok = run_static(base, str(lon), str(lat), zoom=12, width=600, height=300)
        if not ok:
            print("Static image proxy failed — smoke test failed")
            return 3

    print("Smoke test completed successfully")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
