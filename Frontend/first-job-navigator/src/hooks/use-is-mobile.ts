"use client";

import { useEffect, useState } from "react";

export function useIsMobile(maxWidth = 767) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const onChange = () => setIsMobile(mediaQuery.matches);

    onChange();
    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, [maxWidth]);

  return isMobile;
}
