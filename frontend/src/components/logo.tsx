import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3" aria-label="CARE Rwanda Activity Board, home">
      <span className="flex items-baseline gap-1.5">
        <span className="text-[19px] font-extrabold tracking-[0.08em] text-ink">CARE</span>
        <span className="text-[15px] font-medium text-ink-muted">Rwanda</span>
      </span>
      <span aria-hidden className="h-5 w-px bg-line-strong" />
      <span className="text-sm font-medium text-ink-muted group-hover:text-ink">Activity Board</span>
    </Link>
  );
}
