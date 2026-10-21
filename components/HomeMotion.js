"use client";

import { useLayoutEffect } from "react";

/**
 * Landing page motion: reveals on scroll, nothing else.
 *
 * Elements marked [data-reveal] start slightly low and transparent, then
 * settle when they enter the viewport. The initial styles are written from
 * JS on purpose: without JavaScript the page is simply visible, and with
 * reduced motion the observer is never set up at all.
 *
 * Rendered once from the server page; it owns no markup.
 */
export default function HomeMotion() {
  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = [...document.querySelectorAll("[data-reveal]")];
    if (reduce || !("IntersectionObserver" in window) || targets.length === 0) return;

    targets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition =
        "opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1)";
      el.style.transitionDelay = (el.dataset.delay || 0) + "ms";
      el.style.willChange = "opacity, transform";
    });

    const settle = (el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          settle(entry.target);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    targets.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      targets.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
        el.style.transition = "";
        el.style.transitionDelay = "";
        el.style.willChange = "";
      });
    };
  }, []);

  return null;
}
