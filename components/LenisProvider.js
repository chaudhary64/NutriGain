"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Lenis smooth-scroll provider — scoped to the home page only.
 *
 * Smooth scrolling is a landing-page feel, not an app feel: dashboards need
 * native, instant, predictable scrolling. The provider therefore mounts
 * Lenis only while the pathname is "/" and destroys it on every other route.
 *
 * Hardened against the "page won't scroll" failure mode, which had two
 * interacting causes:
 *
 *  1. Stale zero limit. With a window wrapper, Lenis only re-measures on
 *     window resize. Content that mounts after Lenis boots (fonts, images,
 *     client data) leaves its limit stale — every wheel event becomes a
 *     no-op. Fixed by ResizeObserver on <body>/<html>, plus a self-healing
 *     guard that compares the limit to the real document each beat.
 *
 *  2. Dead animation loop. An external rAF chain can be cancelled (StrictMode
 *     double-mounts, provider re-runs) and Lenis then never advances its
 *     tween — scrollTo() sets isScrolling="smooth" but nothing moves. Fixed
 *     by using Lenis's built-in autoRaf so the instance owns its own loop.
 *
 * All resizes are gated on !isScrolling: resize() mid-animation resets
 * animatedScroll and visibly kills smooth scrolling.
 */
export default function LenisProvider({ children }) {
  const pathname = usePathname();
  const lenisRef = useRef(null);

  const onHome = pathname === "/";

  // Reset scroll to top on navigation so pages never open mid-scroll.
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    // Native scrolling everywhere except the home page.
    if (!onHome) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete window.lenis;
      }
      return;
    }

    let disposeSync = null;
    let retryTimer = null;

    const boot = () => {
      // The document must have real dimensions before Lenis measures it.
      if (document.documentElement.scrollHeight === 0) return false;

      try {
        const lenis = new Lenis({
          lerp: 0.08,
          smoothWheel: true,
          autoRaf: true,
        });
        lenisRef.current = lenis;
        window.lenis = lenis;

        // Keep measurements fresh as late content (fonts, images, data) lands.
        const safeSync = () => {
          const l = lenisRef.current;
          if (!l || l.isScrolling) return;
          l.resize();
        };
        if (document.fonts?.ready) document.fonts.ready.then(safeSync).catch(() => {});
        window.addEventListener("load", safeSync);
        const ro = new ResizeObserver(safeSync);
        ro.observe(document.body);
        ro.observe(document.documentElement);
        const t1 = setTimeout(safeSync, 300);
        const t2 = setTimeout(safeSync, 1200);

        // Self-healing guard: late-mounting content can leave a stale limit
        // (the page then refuses to scroll). Compare against the real document
        // each beat and re-measure on mismatch.
        const guard = setInterval(() => {
          const l = lenisRef.current;
          if (!l || l.isScrolling) return;
          const real = document.documentElement.scrollHeight - window.innerHeight;
          if (real > 0 && l.limit !== real) l.resize();
        }, 400);

        disposeSync = () => {
          window.removeEventListener("load", safeSync);
          ro.disconnect();
          clearTimeout(t1);
          clearTimeout(t2);
          clearInterval(guard);
        };

        return true;
      } catch (err) {
        window.__lenisError = String(err);
        return false;
      }
    };

    if (!boot()) {
      retryTimer = setTimeout(() => boot(), 250);
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (disposeSync) disposeSync();
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete window.lenis;
      }
    };
  }, [onHome]);

  return <>{children}</>;
}
