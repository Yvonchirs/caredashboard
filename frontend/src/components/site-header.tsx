import { ArrowRight, LayoutGrid } from "lucide-react";
import Link from "next/link";
import type { User } from "@/lib/types";
import { Logo } from "./logo";
import { buttonStyles } from "./ui";

export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="bg-navy">
      <div data-tv-wide data-tv-header className="mx-auto flex h-18 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Logo />
        {user ? (
          <Link href="/workspace" data-tv-hide className={buttonStyles({ size: "sm" })}>
            <LayoutGrid aria-hidden />
            My workspace
          </Link>
        ) : (
          <Link href="/login" data-tv-hide className={buttonStyles({ size: "sm" })}>
            Staff sign in
            <ArrowRight aria-hidden />
          </Link>
        )}
      </div>
    </header>
  );
}
