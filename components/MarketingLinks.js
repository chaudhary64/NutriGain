"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import NavIcon from "@/components/NavIcon";

gsap.registerPlugin(useGSAP);

/**
 * The landing page's section links.
 *
 * The page is one argument in four parts, so the bar keeps those four parts —
 * and only those — as its navigation. Two behaviours belong with the links
 * rather than with the shell:
 *
 *  - The section the reader is in is marked. On a page you scroll through, the
 *    bar is the only place the reader can see where they are, and a hover-only
 *    underline leaves that unanswered.
 *  - Below 940px the links move behind the bar's menu instead of disappearing.
 *    Losing every section link above the fold on a phone was the bar's largest
 *    hole: the page is long, and the bar is the only map. The menu carries the
 *    account end and the appearance control too, so the phone bar is the mark
 *    and one button rather than a row of small targets.
 *
 * The marker is read from the section's own box — no scroll offsets, no table
 * of offsets to keep in sync — and the state only moves when the answer
 * changes, so a scroll that stays inside one section costs nothing.
 */
const SECTIONS = [
  { id: "features", label: "Features" },
  { id: "how", label: "How it works" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

/* The bar is 64px; add the breathing room a section needs above itself before
   it counts as the one being read. */
const READ_LINE = 88;

export default function MarketingLinks({ renderMenu, brand }) {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  // The sheet stays mounted while it leaves, so the exit is an animation
  // rather than the node disappearing between frames.
  const [closing, setClosing] = useState(false);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const closeGuard = useRef(null);

  // The sheet leaves before it unmounts. GSAP owns both directions, so the
  // timing lives in one place instead of a keyframe and a matching timeout.
  const close = useCallback(() => {
    if (!open || closing) return;
    const node = panelRef.current;
    setClosing(true);

    const done = () => {
      clearTimeout(closeGuard.current);
      setOpen(false);
      setClosing(false);
    };

    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done();
      return;
    }

    gsap.killTweensOf(node);
    gsap.to(node, {
      yPercent: -14,
      opacity: 0,
      duration: 0.26,
      ease: "power2.in",
      onComplete: done,
    });

    // GSAP runs on rAF, which a backgrounded tab stops: without this the sheet
    // would never unmount and the page would stay scroll-locked.
    closeGuard.current = setTimeout(done, 600);
  }, [open, closing]);

  useEffect(() => () => clearTimeout(closeGuard.current), []);

  // Re-opened mid-close: drop the exit tween and its leftover transform, then
  // let the entrance play from the top again.
  const openMenu = useCallback(() => {
    // A close that is still in flight must not be allowed to finish later and
    // unmount the sheet the reader just asked for again.
    clearTimeout(closeGuard.current);
    const node = panelRef.current;
    if (node) {
      gsap.killTweensOf(node);
      gsap.set(node, { clearProps: "opacity,transform" });
    }
    setClosing(false);
    setOpen(true);
  }, []);

  // Opening: the sheet drops out of the bar and the rows follow it in. expo.out
  // because the travel is long and the landing should be soft.
  useGSAP(
    () => {
      const node = panelRef.current;
      if (!open || closing || !node) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rows = node.querySelectorAll(".mk-panel-nav a");
      const more = node.querySelector(".mk-menu-more");
      const closeBtn = node.querySelector(".mk-panel-close");

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(node, { yPercent: -100, duration: 0.6 });
      if (closeBtn) tl.from(closeBtn, { opacity: 0, duration: 0.4 }, 0.12);
      if (rows.length) tl.from(rows, { y: 14, opacity: 0, duration: 0.5, stagger: 0.05 }, 0.1);
      if (more) tl.from(more, { y: 14, opacity: 0, duration: 0.5 }, 0.3);
    },
    { scope: panelRef, dependencies: [open, closing] }
  );

  useEffect(() => {
    const targets = SECTIONS.map((section) => document.getElementById(section.id)).filter(Boolean);
    if (!targets.length) return;

    // Four rectangles and a comparison: cheap enough to read on the event, and
    // React bails out when the answer is the state it already holds.
    const read = () => {
      const current = targets.find((el) => {
        const { top, bottom } = el.getBoundingClientRect();
        return top <= READ_LINE && bottom > READ_LINE;
      });
      const next = current ? current.id : "";
      setActive((previous) => (previous === next ? previous : next));
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  // Focus returns to the button that opened the sheet — otherwise the browser
  // drops it on <body> and the next Tab starts at the top of the page. Done in
  // an effect rather than in the close handler so nothing reads a ref during
  // render.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // The sheet covers the page, so the scroll underneath has to stop and the
  // focus has to go somewhere inside it. Escape hands both back.
  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape") close();
    };

    // Stopping the scroll also removes the page's scrollbar, and the viewport
    // grows by its width — every centred thing on the page jumps sideways by
    // half of it, in full view, while the sheet is still on its way down.
    // `html:has(.mk-panel)` in globals.css reserves that gutter for exactly as
    // long as this sheet exists, which keeps the page still; no width is
    // measured or reapplied by hand here.
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <div className="mk-links">
        {SECTIONS.map((section) => (
          <Link
            key={section.id}
            href={`/#${section.id}`}
            className={"mk-link" + (active === section.id ? " is-active" : "")}
            aria-current={active === section.id ? "location" : undefined}
          >
            {section.label}
          </Link>
        ))}
      </div>

      {/* The bar's menu, drawn as the three lines every site uses for it — the
          bordered chevron it replaces read as a select, not as a way into the
          page's sections. The label stays put and aria-expanded carries the
          state, because the way out is the named Close on the sheet itself. */}
      <button
        ref={toggleRef}
        type="button"
        className="mk-more"
        aria-expanded={open && !closing}
        aria-controls="mk-menu"
        aria-label="Menu"
        onClick={() => (open && !closing ? close() : openMenu())}
      >
        <NavIcon name="menu" />
      </button>

      {/* Portalled out of the bar but not out of the shell: the bar's
          backdrop-filter would otherwise be the containing block for this fixed
          sheet and clip it to 64px, and <body> sits outside the `.app-shell`
          scope, where every --shell-* token the sheet paints with is undefined. */}
      {open &&
        createPortal(
          <div
            id="mk-menu"
            className="mk-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="ng-container mk-panel-head">
              <div className="mk-panel-brand" onClick={close}>{brand}</div>
              <button
                ref={closeRef}
                type="button"
                className="mk-panel-close"
                onClick={close}
                aria-label="Close menu"
              >
                <span className="mk-panel-close-lbl">Close</span>
                <NavIcon name="close" />
              </button>
            </div>

            {/* Going somewhere closes the sheet: one handler on the body
                catches every row, including the ones the shell renders, so no
                caller has to remember to pass a close callback down. */}
            <div
              className="ng-container mk-panel-body"
              onClick={(event) => {
                if (event.target.closest("a, [data-menu-close]")) close();
              }}
            >
              <nav className="mk-panel-nav" aria-label="Sections">
                {SECTIONS.map((section) => (
                  <Link
                    key={section.id}
                    href={`/#${section.id}`}
                    aria-current={active === section.id ? "location" : undefined}
                  >
                    {section.label}
                  </Link>
                ))}
              </nav>

              {/* Everything the bar cannot hold on a phone lives here, and the
                  shell builds it — this component only owns the sheet. */}
              {renderMenu && <div className="mk-menu-more">{renderMenu()}</div>}
            </div>
          </div>,
          document.querySelector(".app-shell") || document.body
        )}
    </>
  );
}
