import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ href = "/", tone = "light" }: { href?: string; tone?: "light" | "dark" }) {
  const onDark = tone === "light";
  return (
    <Link href={href} className="group flex items-center gap-3" aria-label="CARE Rwanda Activity Board, home">
      <span className="flex items-baseline gap-1.5">
        <span className={cn("text-[26px] leading-none font-black tracking-tight", onDark ? "text-white" : "text-ink")}>
          care
        </span>
        <span className={cn("text-[13px] font-bold tracking-[0.12em] uppercase", onDark ? "text-brand-light" : "text-brand")}>
          Rwanda
        </span>
      </span>
      <span aria-hidden className={cn("hidden h-6 w-px sm:block", onDark ? "bg-white/25" : "bg-line-strong")} />
      <span
        className={cn(
          "hidden text-[13px] font-medium tracking-wide uppercase sm:block",
          onDark ? "text-white/75 group-hover:text-white" : "text-ink-muted group-hover:text-ink",
        )}
      >
        Activity Board
      </span>
    </Link>
  );
}
