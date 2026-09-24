import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

const ASPECT = 1563 / 505;
const HEIGHT = 30;

export function Logo({ href = "/", variant = "reversed" }: { href?: string; variant?: "reversed" | "solid" }) {
  const onDark = variant === "reversed";
  return (
    <Link href={href} className="group flex items-center gap-3" aria-label="CARE Rwanda Activity Board, home">
      <Image
        src={onDark ? "/brand/care-logo-white.png" : "/brand/care-logo.png"}
        alt="CARE"
        width={Math.round(HEIGHT * ASPECT)}
        height={HEIGHT}
        priority
        className="w-auto shrink-0"
        style={{ height: HEIGHT }}
      />
      <span aria-hidden className={cn("hidden h-6 w-px sm:block", onDark ? "bg-white/25" : "bg-line-strong")} />
      <span
        className={cn(
          "hidden text-[13px] font-medium tracking-wide uppercase sm:block",
          onDark ? "text-white/75 group-hover:text-white" : "text-ink-muted group-hover:text-ink",
        )}
      >
        Rwanda · Activity Board
      </span>
    </Link>
  );
}
