"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type PortaledPopoverProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
  /** Horizontal alignment relative to the anchor. */
  align?: "start" | "end";
  role?: string;
  "aria-label"?: string;
};

/**
 * Renders children in a fixed-position portal on document.body so menus
 * are not clipped by overflow on scrollable ancestors.
 */
export function PortaledPopover({
  open,
  onClose,
  anchorRef,
  children,
  className,
  align = "start",
  role = "menu",
  "aria-label": ariaLabel,
}: PortaledPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 60,
    visibility: "hidden",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      const rect = anchor.getBoundingClientRect();
      const mh = panel.offsetHeight;
      const mw = panel.offsetWidth;
      const gap = 4;
      const pad = 8;

      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < mh + gap + pad;
      let top = openUp ? rect.top - mh - gap : rect.bottom + gap;
      top = Math.max(pad, Math.min(top, window.innerHeight - mh - pad));

      let left = align === "end" ? rect.right - mw : rect.left;
      left = Math.max(pad, Math.min(left, window.innerWidth - mw - pad));

      setStyle({
        position: "fixed",
        top,
        left,
        zIndex: 60,
        visibility: "visible",
      });
    };

    place();
    const raf = requestAnimationFrame(place);

    // Close when the page/ancestor scrolls so the panel never drifts.
    // Ignore scrolls that happen inside the panel itself (e.g. notification list).
    const dismissOnScroll = (event: Event) => {
      const target = event.target as Node | null;
      if (target && panelRef.current?.contains(target)) return;
      onClose();
    };
    window.addEventListener("resize", onClose);
    window.addEventListener("scroll", dismissOnScroll, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", dismissOnScroll, true);
    };
  }, [open, anchorRef, align, onClose]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={panelRef}
      role={role}
      aria-label={ariaLabel}
      className={cn(className)}
      style={style}
    >
      {children}
    </div>,
    document.body,
  );
}
