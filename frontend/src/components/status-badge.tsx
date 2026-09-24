import { cn } from "@/lib/cn";
import type { ActivityStatus } from "@/lib/types";
import { Badge } from "./ui";

const STATUS: Record<ActivityStatus, { label: string; tone: "danger" | "brand" | "success" }> = {
  live: { label: "Live", tone: "danger" },
  pending: { label: "Pending", tone: "brand" },
  completed: { label: "Completed", tone: "success" },
};

export function StatusBadge({ status, className }: { status: ActivityStatus; className?: string }) {
  const { label, tone } = STATUS[status];
  return (
    <Badge tone={tone} className={cn("shrink-0", className)}>
      {status === "live" && (
        <span aria-hidden className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger/60 motion-reduce:hidden" />
          <span className="relative inline-flex size-1.5 rounded-full bg-danger" />
        </span>
      )}
      {label}
    </Badge>
  );
}
