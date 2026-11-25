"use client";

import { useEffect, useId, useRef } from "react";

export function MobileNav({ children }: { children: React.ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const panelId = useId();

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && details?.open) {
        details.open = false;
      }
    }

    function syncBody() {
      document.body.style.overflow = details?.open ? "hidden" : "";
    }

    function onToggle() {
      syncBody();
    }

    details.addEventListener("toggle", onToggle);
    document.addEventListener("keydown", onKey);
    return () => {
      details.removeEventListener("toggle", onToggle);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  function onNavClick(event: React.MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest("a, button[type='submit']")) closeMenu();
  }

  return (
    <div className="mobile-nav">
      <details ref={detailsRef} className="mobile-nav-details">
        <summary
          className="nav-toggle"
          aria-controls={panelId}
        >
          <span className="sr-only">Menu</span>
          <span className="nav-toggle__bars" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </summary>
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={closeMenu}
        />
        <nav
          id={panelId}
          className="site-nav site-nav--drawer"
          aria-label="Main"
          onClick={onNavClick}
        >
          {children}
        </nav>
      </details>
      <nav className="site-nav site-nav--desktop" aria-label="Main">
        {children}
      </nav>
    </div>
  );
}
