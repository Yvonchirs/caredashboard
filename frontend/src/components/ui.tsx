import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "navy" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-ink hover:bg-brand-light",
  navy: "bg-navy text-white hover:bg-navy-700",
  secondary: "border-2 border-ink/80 text-ink hover:bg-ink hover:text-white",
  ghost: "text-ink-muted hover:bg-ink-50 hover:text-ink",
  danger: "border-2 border-danger/70 text-danger hover:bg-danger hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 gap-1.5 px-4 text-[13px] font-medium",
  md: "h-11 gap-2 px-7 text-sm font-bold tracking-[0.06em] uppercase",
};

export function buttonStyles({ variant = "primary", size = "md" }: { variant?: Variant; size?: Size } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-full whitespace-nowrap transition-colors",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

const control =
  "w-full rounded-md border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-subtle " +
  "transition-colors hover:border-ink-subtle focus:border-navy focus:outline-none focus-visible:outline-none " +
  "focus:ring-3 focus:ring-brand/30 disabled:bg-ink-50 aria-invalid:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 py-2.5", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(control, "h-11 pr-8", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  optional,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-bold text-ink">
        {label}
        {optional && <span className="font-normal text-ink-subtle"> (optional)</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-subtle">{hint}</p>}
    </div>
  );
}

type Tone = "neutral" | "brand" | "success" | "danger" | "ink";

const tones: Record<Tone, string> = {
  neutral: "bg-ink-50 text-ink-muted ring-ink-100",
  brand: "bg-brand-50 text-brand-dark ring-brand-100",
  success: "bg-success-50 text-success ring-success/15",
  danger: "bg-danger-50 text-danger ring-danger/15",
  ink: "bg-navy text-white ring-navy",
};

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Alert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border-l-4 px-4 py-3 text-sm",
        tone === "error" ? "border-danger bg-danger-50 text-danger" : "border-success bg-success-50 text-success",
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b-2 border-ink pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow text-brand">{eyebrow}</p>}
        <h1 className="mt-1 font-headline text-4xl text-balance sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted text-pretty">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
