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
    <main className="grid flex-1 lg:grid-cols-2">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-navy px-6 py-8 text-white sm:px-12 lg:py-12">
        <Logo />
        <div aria-hidden className="absolute -right-32 -bottom-32 hidden size-[28rem] rounded-full border-[64px] border-brand lg:block" />
        <div className="relative mt-16 max-w-lg lg:mt-0">
          <p className="eyebrow text-brand-light">Staff portal</p>
          <p className="mt-3 font-headline text-5xl text-balance lg:text-6xl">See what every team is doing, every day.</p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
            One shared board for all CARE Rwanda projects, so colleagues can find each other in the field and work
            together.
          </p>
        </div>
        <p className="relative mt-12 hidden text-xs text-white/50 lg:block">CARE Rwanda · Kigali</p>
      </aside>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-headline text-4xl">Sign in</h1>
          <p className="mt-2 text-[15px] text-ink-muted">Log your field activities and manage projects.</p>
          <LoginForm next={typeof next === "string" ? next : ""} />
          <p className="mt-8 border-t border-line pt-5 text-sm text-ink-subtle">
            Forgot your password? Ask a system administrator to reset it for you.
          </p>
        </div>
      </div>
    </main>
  );
}
