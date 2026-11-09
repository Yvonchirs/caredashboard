import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Sun, type LucideIcon } from "lucide-react";

// One representative town per province (Kigali City excluded).
const PROVINCES = [
  { name: "Northern", town: "Musanze", lat: -1.4998, lon: 29.6344 },
  { name: "Southern", town: "Huye", lat: -2.5967, lon: 29.7394 },
  { name: "Eastern", town: "Rwamagana", lat: -1.9487, lon: 30.4347 },
  { name: "Western", town: "Rubavu", lat: -1.6794, lon: 29.2564 },
] as const;

type Current = { temperature_2m: number; weather_code: number };
type Daily = { weather_code: number[]; precipitation_probability_max: number[] };
type Forecast = { current: Current; daily: Daily };

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

const isRainCode = (code: number) => (code >= 51 && code <= 67) || (code >= 80 && code <= 99);

function listNames(names: string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];
}

// Today's outlook: rain if the chance is 50%+ or the day's dominant code is wet.
function summarize(forecasts: Forecast[]): { text: string; rain: boolean } {
  const rainy: string[] = [];
  const sunny: string[] = [];
  forecasts.forEach((f, i) => {
    const code = f.daily.weather_code[0];
    const chance = f.daily.precipitation_probability_max[0] ?? 0;
    if (chance >= 50 || isRainCode(code)) rainy.push(PROVINCES[i].name);
    else if (code <= 2 && chance < 30) sunny.push(PROVINCES[i].name);
  });

  if (rainy.length === PROVINCES.length) return { text: "Rain expected today across all four provinces.", rain: true };
  if (rainy.length) return { text: `Rain expected today in ${listNames(rainy)}. Dry elsewhere.`, rain: true };
  if (sunny.length === PROVINCES.length) return { text: "A sunny day across all four provinces.", rain: false };
  if (sunny.length) return { text: `No rain today. Sunny in ${listNames(sunny)}, cloudier elsewhere.`, rain: false };
  return { text: "No rain expected today, but it will be cloudy.", rain: false };
}

async function loadWeather(): Promise<Forecast[] | null> {
  const params = new URLSearchParams({
    latitude: PROVINCES.map((p) => p.lat).join(","),
    longitude: PROVINCES.map((p) => p.lon).join(","),
    current: "temperature_2m,weather_code",
    daily: "weather_code,precipitation_probability_max",
    forecast_days: "1",
    timezone: "Africa/Kigali",
  });
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data: Forecast[] = await res.json();
    return data.length === PROVINCES.length ? data : null;
  } catch {
    return null;
  }
}

export async function WeatherStrip() {
  const weather = await loadWeather();
  if (!weather) return null;
  const { text, rain } = summarize(weather);
  const SummaryIcon = rain ? CloudRain : Sun;

  return (
    <section aria-label="Weather in Rwanda's provinces" data-tv-weather>
      <p className="mb-4 flex items-center gap-2 text-[15px] font-medium text-white">
        <SummaryIcon className="size-5 shrink-0 text-brand-light" aria-hidden />
        {text}
      </p>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        {PROVINCES.map((province, i) => {
          const { label, Icon } = describe(weather[i].current.weather_code);
          return (
            <li key={province.name} className="flex items-center gap-3">
              <Icon className="size-7 shrink-0 text-brand-light" aria-hidden />
              <div>
                <p className="text-xs font-medium tracking-wide text-white/70 uppercase">
                  {province.name} · {province.town}
                </p>
                <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-white/70">
                  <span className="font-headline text-2xl text-white tabular">{Math.round(weather[i].current.temperature_2m)}°C</span>
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
