"use client";

import { Minimize, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "care-board-tv-zoom";
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 3;
const STEP = 0.1;
/** The board is designed for a 1280×720 canvas; auto zoom scales that up to fill the screen. */
const DESIGN_SIZE = { width: 1280, height: 720 };
const MIN_COLUMN_WIDTH = 240;
const PANEL_AND_GUTTERS = 352 + 32 + 80;
const IDLE_MS = 4000;
const SCROLL_PX_PER_SECOND = 24;
const SCROLL_PAUSE_MS = 5000;

const clamp = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));

function subscribeFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function readStoredZoom(): number | null {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return value ? clamp(value) : null;
  } catch {
    return null;
  }
}

/** Turns full screen into a TV layout: scaled to the screen, fitted to one view, with text size controls. */
export function TvMode() {
  const active = useSyncExternalStore(subscribeFullscreen, () => document.fullscreenElement !== null, () => false);
  const viewport = useSyncExternalStore(subscribeResize, () => `${window.innerWidth}x${window.innerHeight}`, () => "0x0");
  const [manualZoom, setManualZoom] = useState<number | null>(() => (typeof window === "undefined" ? null : readStoredZoom()));
  const [idle, setIdle] = useState(false);

  const [width, height] = viewport.split("x").map(Number);
  const autoZoom = clamp(Math.max(1, Math.min(width / DESIGN_SIZE.width, height / DESIGN_SIZE.height)));
  const zoom = manualZoom ?? autoZoom;
  const columns = Math.min(4, Math.max(1, Math.floor((width / zoom - PANEL_AND_GUTTERS) / MIN_COLUMN_WIDTH)));

  function changeZoom(next: number | null) {
    setManualZoom(next === null ? null : clamp(next));
    try {
      if (next === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, String(clamp(next)));
    } catch {
      // Storage unavailable: the size still applies for this session.
    }
  }

  // Apply the layout to <html> while full screen is on.
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.dataset.tv = "";
    root.style.setProperty("--tv-zoom", String(zoom));
    root.style.setProperty("--tv-cols", String(columns));
    return () => {
      delete root.dataset.tv;
      delete root.dataset.tvIdle;
      root.style.removeProperty("--tv-zoom");
      root.style.removeProperty("--tv-cols");
    };
  }, [active, zoom, columns]);

  // Hide the controls and cursor when nobody is using the remote, mouse or keyboard.
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    if (!active) return;
    let timer = 0;
    const wake = () => {
      setIdle(false);
      delete document.documentElement.dataset.tvIdle;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setIdle(true);
        document.documentElement.dataset.tvIdle = "";
      }, IDLE_MS);
    };
    const onKey = (event: KeyboardEvent) => {
      wake();
      if (event.key === "+" || event.key === "=") changeZoom(zoomRef.current + STEP);
      else if (event.key === "-" || event.key === "_") changeZoom(zoomRef.current - STEP);
      else if (event.key === "0") changeZoom(null);
    };
    wake();
    window.addEventListener("pointermove", wake);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  // Slowly scroll areas that don't fit, pausing at the top and bottom, so a wall display shows everything.
  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const state = new Map<HTMLElement, { resumeAt: number; position: number }>();
    let frame = 0;
    let last = performance.now();
    const pauseOnUserScroll = (event: Event) => {
      const entry = state.get(event.currentTarget as HTMLElement);
      if (entry) entry.resumeAt = performance.now() + 15_000;
    };
    const tick = (now: number) => {
      const elapsed = now - last;
      last = now;
      for (const el of document.querySelectorAll<HTMLElement>("[data-tv-scroll]")) {
        let entry = state.get(el);
        if (!entry) {
          entry = { resumeAt: now + SCROLL_PAUSE_MS, position: el.scrollTop };
          state.set(el, entry);
          el.addEventListener("wheel", pauseOnUserScroll, { passive: true });
          el.addEventListener("touchstart", pauseOnUserScroll, { passive: true });
        }
        const max = el.scrollHeight - el.clientHeight;
        if (max <= 1 || now < entry.resumeAt) {
          entry.position = el.scrollTop;
          continue;
        }
        if (el.scrollTop >= max - 1) {
          el.scrollTo({ top: 0, behavior: "smooth" });
          entry.position = 0;
          entry.resumeAt = now + SCROLL_PAUSE_MS * 2;
          continue;
        }
        entry.position = Math.min(max, entry.position + (SCROLL_PX_PER_SECOND * elapsed) / 1000);
        el.scrollTop = entry.position;
        if (el.scrollTop >= max - 1) entry.resumeAt = now + SCROLL_PAUSE_MS;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      for (const el of state.keys()) {
        el.removeEventListener("wheel", pauseOnUserScroll);
        el.removeEventListener("touchstart", pauseOnUserScroll);
      }
    };
  }, [active]);

  if (!active) return null;

  const control = "inline-flex size-9 items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-40 [&_svg]:size-4";
  return (
    <div
      role="toolbar"
      aria-label="Display settings"
      className={cn(
        "fixed right-4 bottom-4 z-50 flex items-center gap-1 rounded-full bg-navy/95 p-1 pl-4 text-white shadow-lg shadow-ink/30 transition-opacity duration-300",
        idle && "pointer-events-none opacity-0",
      )}
    >
      <span className="mr-1 text-xs font-bold tracking-wide text-white/70 uppercase">Text size</span>
      <button type="button" className={control} onClick={() => changeZoom(zoom - STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Smaller">
        <Minus aria-hidden />
      </button>
      <button
        type="button"
        className="h-9 min-w-16 rounded-full px-2 text-sm font-bold tabular hover:bg-white/15"
        onClick={() => changeZoom(null)}
        title="Reset to fit the screen"
      >
        {manualZoom === null ? "Auto" : `${Math.round(zoom * 100)}%`}
      </button>
      <button type="button" className={control} onClick={() => changeZoom(zoom + STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Larger">
        <Plus aria-hidden />
      </button>
      <span className="mx-1 h-5 w-px bg-white/25" aria-hidden />
      <button
        type="button"
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold hover:bg-white/15 [&_svg]:size-4"
        onClick={() => document.exitFullscreen().catch(() => {})}
      >
        <Minimize aria-hidden />
        Exit
      </button>
    </div>
  );
}
