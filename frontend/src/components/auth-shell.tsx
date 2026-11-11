import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

/** Two-column frame shared by the sign-in, forgot-password and reset-password pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
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
          <h1 className="font-headline text-4xl">{title}</h1>
          <p className="mt-2 text-[15px] text-ink-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
