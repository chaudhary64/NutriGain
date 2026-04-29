"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useUserSettings } from "@/context/UserSettingsContext";

export default function LenisProvider({ children }) {
  const { smoothScroll, mounted } = useUserSettings();
  const lenisRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!mounted) return;

    if (smoothScroll) {
      const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      lenisRef.current = lenis;
      window.lenis = lenis;

      function raf(time) {
        lenis.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      }
      rafRef.current = requestAnimationFrame(raf);
    } else {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete window.lenis;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete window.lenis;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [smoothScroll, mounted]);

  return <>{children}</>;
}
