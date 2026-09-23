import type { Dashboard } from "@/lib/types";

export function StatsStrip({ stats }: { stats: Dashboard["stats"] }) {
  const items = [
    { label: "Activities", value: stats.activities },
    { label: "Projects active", value: stats.projects },
    { label: "Staff in the field", value: stats.staff },
    { label: "Locations", value: stats.locations },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse border-l-2 border-brand pl-4">
          <dt className="mt-1 text-xs font-medium tracking-wide text-white/70 uppercase">{item.label}</dt>
          <dd className="font-headline text-3xl text-white tabular sm:text-4xl">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
