"use client";

import { Maximize, Minimize } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

/** Puts the whole board in full screen for wall displays; hidden where the Fullscreen API is unavailable. */
export function FullscreenToggle({ className }: { className?: string }) {
  const supported = useSyncExternalStore(subscribe, () => document.fullscreenEnabled, () => false);
  const active = useSyncExternalStore(subscribe, () => document.fullscreenElement !== null, () => false);
  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={() => (active ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {})}
      className={className}
      aria-pressed={active}
    >
      {active ? <Minimize aria-hidden /> : <Maximize aria-hidden />}
      {active ? "Exit full screen" : "Full screen"}
    </button>
  );
}
