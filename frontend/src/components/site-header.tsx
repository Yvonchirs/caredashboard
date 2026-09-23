import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import type { User } from "@/lib/types";
import { Logo } from "./logo";
import { buttonStyles } from "./ui";

export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        {user ? (
          <Link href="/workspace" className={buttonStyles({ variant: "secondary", size: "sm" })}>
            <LayoutGrid aria-hidden />
            My workspace
          </Link>
        ) : (
          <Link href="/login" className={buttonStyles({ variant: "primary", size: "sm" })}>
            Staff sign in
          </Link>
        )}
      </div>
    </header>
  );
}
