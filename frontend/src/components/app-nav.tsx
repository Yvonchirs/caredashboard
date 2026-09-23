"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { UserRole } from "@/lib/types";

const LINKS: { href: string; label: string; roles?: UserRole[] }[] = [
  { href: "/", label: "Board" },
  { href: "/workspace", label: "My activities" },
  { href: "/admin/projects", label: "Projects", roles: ["admin"] },
  { href: "/admin/users", label: "Users", roles: ["admin"] },
];

export function AppNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="-mb-px flex gap-1 overflow-x-auto">
      {LINKS.filter((link) => !link.roles || link.roles.includes(role)).map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "border-brand text-ink" : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
