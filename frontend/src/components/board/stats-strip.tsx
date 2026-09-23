import type { Dashboard } from "@/lib/types";

export function StatsStrip({ stats }: { stats: Dashboard["stats"] }) {
  const items = [
    { label: "Activities", value: stats.activities },
    { label: "Projects active", value: stats.projects },
    { label: "Staff involved", value: stats.staff },
    { label: "Locations", value: stats.locations },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-5 py-4">
          <dt className="text-[13px] text-ink-muted">{item.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight tabular">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
