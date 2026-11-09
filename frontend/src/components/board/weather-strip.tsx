import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Sun, type LucideIcon } from "lucide-react";

// One representative town per province (Kigali City excluded).
const PROVINCES = [
  { name: "Northern", town: "Musanze", lat: -1.4998, lon: 29.6344 },
  { name: "Southern", town: "Huye", lat: -2.5967, lon: 29.7394 },
  { name: "Eastern", town: "Rwamagana", lat: -1.9487, lon: 30.4347 },
  { name: "Western", town: "Rubavu", lat: -1.6794, lon: 29.2564 },
] as const;

type Current = { temperature_2m: number; weather_code: number };

// WMO weather interpretation codes.
function describe(code: number): { label: string; Icon: LucideIcon } {
  if (code === 0) return { label: "Clear", Icon: Sun };
  if (code <= 2) return { label: "Partly cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if (code <= 48) return { label: "Fog", Icon: CloudFog };
  if (code <= 57) return { label: "Drizzle", Icon: CloudDrizzle };
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: "Rain", Icon: CloudRain };
  if (code >= 95) return { label: "Thunderstorm", Icon: CloudLightning };
  return { label: "Showers", Icon: CloudRain };
}

async function loadWeather(): Promise<Current[] | null> {
  const params = new URLSearchParams({
    latitude: PROVINCES.map((p) => p.lat).join(","),
    longitude: PROVINCES.map((p) => p.lon).join(","),
    current: "temperature_2m,weather_code",
    timezone: "Africa/Kigali",
  });
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data: { current: Current }[] = await res.json();
    return data.length === PROVINCES.length ? data.map((d) => d.current) : null;
  } catch {
    return null;
  }
}

export async function WeatherStrip() {
  const weather = await loadWeather();
  if (!weather) return null;

  return (
    <section aria-label="Weather in Rwanda's provinces" data-tv-weather>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        {PROVINCES.map((province, i) => {
          const { label, Icon } = describe(weather[i].weather_code);
          return (
            <li key={province.name} className="flex items-center gap-3">
              <Icon className="size-7 shrink-0 text-brand-light" aria-hidden />
              <div>
                <p className="text-xs font-medium tracking-wide text-white/70 uppercase">
                  {province.name} · {province.town}
                </p>
                <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-white/70">
                  <span className="font-headline text-2xl text-white tabular">{Math.round(weather[i].temperature_2m)}°C</span>
                  <span>{label}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
