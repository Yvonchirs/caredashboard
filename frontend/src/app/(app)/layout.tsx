import { KeyRound, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui";
import { logout } from "@/lib/actions";
import { getCurrentUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4">
            <Logo />
            <div className="flex items-center gap-1">
              <div className="mr-2 hidden text-right sm:block">
                <p className="text-sm leading-tight font-bold">{user.name}</p>
                <p className="text-xs text-white/60">{user.email}</p>
              </div>
              {user.role === "admin" && (
                <Badge tone="brand" className="mr-2 hidden ring-0 sm:inline-flex">
                  Admin
                </Badge>
              )}
              <Link
                href="/account/password"
                className="rounded-full p-2.5 text-white/75 hover:bg-white/10 hover:text-white"
                aria-label="Change password"
                title="Change password"
              >
                <KeyRound className="size-4" />
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full p-2.5 text-white/75 hover:bg-white/10 hover:text-white"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
          {!user.mustChangePassword && <AppNav role={user.role} />}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}
