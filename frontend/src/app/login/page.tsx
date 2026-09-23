import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  if (await getCurrentUser().catch(() => null)) redirect("/workspace");

  return (
    <main className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Log your field activities and manage projects.</p>
          <LoginForm next={typeof next === "string" ? next : ""} />
          <p className="mt-8 text-xs text-ink-subtle">
            Forgot your password? Ask a system administrator to reset it for you.
          </p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-end lg:p-14">
        <div aria-hidden className="absolute -top-24 -right-24 size-96 rounded-full border-[56px] border-brand/90" />
        <div aria-hidden className="absolute top-64 -right-10 size-40 rounded-full bg-white/5" />
        <blockquote className="relative max-w-md">
          <p className="text-3xl leading-tight font-semibold tracking-tight text-balance">
            See what every team is doing, every day.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            One shared board for all CARE Rwanda projects, so colleagues can find each other in the field and work
            together.
          </p>
        </blockquote>
      </aside>
    </main>
  );
}
