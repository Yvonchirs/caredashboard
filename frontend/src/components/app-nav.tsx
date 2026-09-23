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
    <nav aria-label="Main" className="-mb-px flex gap-6 overflow-x-auto">
      {LINKS.filter((link) => !link.roles || link.roles.includes(role)).map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-b-4 py-3.5 text-[13px] font-bold tracking-[0.06em] whitespace-nowrap uppercase transition-colors",
              active ? "border-brand text-white" : "border-transparent text-white/65 hover:text-white",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
