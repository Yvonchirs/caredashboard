"use client";

import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { BoardView } from "@/lib/dates";

export function DateJump({ view, date, className }: { view: BoardView; date: string; className?: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  return (
    <label className={className}>
      <CalendarDays aria-hidden />
      <span>Pick date</span>
      <input
        ref={input}
        type="date"
        value={date}
        onClick={() => input.current?.showPicker?.()}
        onChange={(event) => event.target.value && router.push(`/?view=${view}&date=${event.target.value}`)}
        className="sr-only"
        aria-label="Jump to date"
      />
    </label>
  );
}
