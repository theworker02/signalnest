import { AlertTriangle, CloudRain, CloudSun, Compass, Droplets, Gauge, MapPin, Navigation, RadioTower, ThermometerSun, Wind } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { signalEvents } from "../data/mockData";
import { Link } from "../lib/navigation";
import { severityClass } from "../lib/utils";
import { useAppStore } from "../stores/useAppStore";

type LocationTarget = {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  focus: string;
};

type WeatherReading = {
  current: number;
  previous: number;
  values: number[];
  time?: string;
  temperature?: number;
  apparent?: number;
  humidity?: number;
  precipitation?: number;
  rain?: number;
  windSpeed?: number;
  windGust?: number;
  windDirection?: number;
  code?: number;
};

type PressureMode = "surface" | "sea-level";

type LocationState =
  | { status: "disabled" | "loading"; message: string }
  | { status: "ready"; latitude: number; longitude: number; accuracy?: number; message: string; name: string; region: string }
  | { status: "error"; message: string };

const exampleLocations: LocationTarget[] = [
  { id: "nyc", name: "New York", region: "Northeast corridor", latitude: 40.7128, longitude: -74.006, focus: "Transit, rain, coastal flood" },
  { id: "miami", name: "Miami", region: "Gulf and Atlantic risk", latitude: 25.7617, longitude: -80.1918, focus: "Tropical rain, heat, wind" },
  { id: "denver", name: "Denver", region: "Mountain west", latitude: 39.7392, longitude: -104.9903, focus: "Pressure swings, snow, wind" },
  { id: "seattle", name: "Seattle", region: "Pacific northwest", latitude: 47.6062, longitude: -122.3321, focus: "Rain bands, wind, marine air" },
  { id: "phoenix", name: "Phoenix", region: "Desert southwest", latitude: 33.4484, longitude: -112.074, focus: "Heat index, dry air, dust" },
  { id: "chicago", name: "Chicago", region: "Great Lakes", latitude: 41.8781, longitude: -87.6298, focus: "Lake wind, storms, cold fronts" },
];

const fallbackWeather: WeatherReading = {
  current: 1014.2,
  previous: 1011.8,
  values: [1009.6, 1010.1, 1010.8, 1011.4, 1011.8, 1012.2, 1012.9, 1013.5, 1014.2],
  time: "Demo baseline",
  temperature: 68,
  apparent: 67,
  humidity: 54,
  precipitation: 0,
  rain: 0,
  windSpeed: 9,
  windGust: 16,
  windDirection: 240,
  code: 2,
};

const regionalChanges = [
  ["Northeast corridor", "Thunderstorm watch expanded across three transit zones.", "high"],
  ["Gulf coast", "Flood advisory added after rainfall models crossed 2.5 in/hr.", "critical"],
  ["Mountain west", "Air quality alert triggered by wildfire smoke plume movement.", "medium"],
  ["Great Lakes", "Wind advisory overlaps with power outage restoration zones.", "medium"],
  ["Pacific northwest", "Rapid pressure dip suggests a stronger inbound rain band.", "high"],
  ["Desert southwest", "Heat index watch remains elevated while humidity trends lower.", "medium"],
];

const weatherSignals = [
  { label: "Warnings", value: "14", delta: "+6", icon: AlertTriangle, tone: "text-rose-300" },
  { label: "AQI hits", value: "3", delta: "+1", icon: Wind, tone: "text-amber" },
  { label: "Flood risk", value: "7", delta: "+4", icon: Droplets, tone: "text-cyan" },
  { label: "Heat alerts", value: "5", delta: "+2", icon: ThermometerSun, tone: "text-orange-200" },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function pressureTrend(delta: number) {
  if (delta <= -1.5) return "Falling pressure";
  if (delta >= 1.5) return "Rising pressure";
  return "Stable pressure";
}

function weatherLabel(code?: number) {
  if (code === undefined) return "Mixed conditions";
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Active weather";
}

function compactTime(value?: string) {
  if (!value) return "recent";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function closestPressureValues(times: string[], values: Array<number | null>, currentTime?: string) {
  const numeric = values.map((value, index) => ({ time: times[index], value })).filter((item): item is { time: string; value: number } => typeof item.value === "number");
  if (!numeric.length) return fallbackWeather.values;
  if (!currentTime) return numeric.slice(-12).map((item) => item.value);
  const currentMs = new Date(currentTime).getTime();
  const closestIndex = numeric.reduce((bestIndex, item, index) => {
    const bestDistance = Math.abs(new Date(numeric[bestIndex].time).getTime() - currentMs);
    const distance = Math.abs(new Date(item.time).getTime() - currentMs);
    return distance < bestDistance ? index : bestIndex;
  }, 0);
  return numeric.slice(Math.max(0, closestIndex - 8), closestIndex + 1).map((item) => item.value);
}

function SourceStatus({ title, health, interval }: { title: string; health: number; interval: string }) {
  const lowerTitle = title.toLowerCase();
  const metric = lowerTitle.includes("weather")
    ? { label: "Advisory sync", value: "NOAA watch", tone: "text-amber" }
    : lowerTitle.includes("outage")
      ? { label: "Coverage", value: "CDN mesh", tone: "text-rose-300" }
      : lowerTitle.includes("airport")
        ? { label: "Delay feed", value: "FAA live", tone: "text-cyan" }
        : lowerTitle.includes("air")
          ? { label: "Station quorum", value: "AQI active", tone: "text-amber" }
          : { label: "Source health", value: `${health}%`, tone: "text-emerald-200" };

  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-400">{metric.label}</span>
        <span className={`font-bold ${metric.tone}`}>{metric.value}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-amber via-cyan to-emerald-200" style={{ width: `${clamp(health, 8, 100)}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
        <span>refresh {interval}</span>
        <span>{health >= 85 ? "ready" : health >= 70 ? "watching" : "degraded"}</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail }: { icon: typeof CloudSun; label: string; value: string; detail: string }) {
  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Icon className="h-5 w-5 text-cyan" />
        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 text-xs font-bold text-slate-300">{detail}</span>
      </div>
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-black text-white">{value}</div>
    </section>
  );
}

function PressureBarometer({ reading, location, loading, mode }: { reading: WeatherReading; location: LocationState; loading: boolean; mode: PressureMode }) {
  const delta = reading.current - reading.previous;
  const trend = pressureTrend(delta);
  const position = clamp(((reading.current - 980) / 60) * 100, 3, 97);
  const sparkline = reading.values.length > 1 ? reading.values : fallbackWeather.values;
  const pressureTone = reading.current < 1000 ? "Storm watch" : reading.current > 1022 ? "Settled air" : "Fair range";
  const trendColor = delta < 0 ? "text-amber" : delta > 0 ? "text-emerald-200" : "text-slate-300";
  const pressureLabel = mode === "surface" ? "hPa at surface" : "hPa sea-level";

  return (
    <section className="panel overflow-hidden rounded-lg">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-cyan">
              <Gauge className="h-4 w-4" />
              Pressure Barometer
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">Atmospheric pressure, decoded</h2>
          </div>
          <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-bold text-cyan">{weatherLabel(reading.code)}</span>
        </div>
      </div>
      <div className="grid gap-5 p-5 xl:grid-cols-[280px_minmax(0,1fr)_260px]">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <Gauge className="h-4 w-4" />
            Current reading
          </div>
          <div className="mt-4 text-5xl font-black text-white">{reading.current.toFixed(1)}</div>
          <div className="mt-1 text-sm font-bold text-cyan">{pressureLabel}</div>
          <div className={`mt-4 text-sm font-bold ${trendColor}`}>
            {trend}: {delta >= 0 ? "+" : ""}{delta.toFixed(1)} hPa
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-bold text-white">Readable pressure range</div>
              <div className="mt-1 text-xs text-slate-500">Lower pressure often means more unsettled weather. Higher pressure usually means calmer air.</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-bold text-slate-300">{loading ? "Updating" : pressureTone}</span>
          </div>
          <div>
            <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-white/10 text-center text-xs font-bold">
              <div className="bg-rose-400/12 px-2 py-2 text-rose-200">Low / Stormy</div>
              <div className="bg-cyan/10 px-2 py-2 text-cyan">Normal / Fair</div>
              <div className="bg-emerald-300/10 px-2 py-2 text-emerald-200">High / Settled</div>
            </div>
            <div className="relative mt-7 h-3 rounded-full bg-gradient-to-r from-rose-400/50 via-cyan/45 to-emerald-300/45">
              <div className="absolute -top-6 h-12 w-px bg-white" style={{ left: `${position}%` }} />
              <div className="absolute -top-2 h-7 w-7 -translate-x-1/2 rounded-full border border-white/60 bg-cyan shadow-[0_0_20px_rgba(74,215,255,0.35)]" style={{ left: `${position}%` }} />
            </div>
            <div className="mt-6 flex justify-between text-xs text-slate-500">
              <span>980</span>
              <span>1000</span>
              <span>1010</span>
              <span>1022</span>
              <span>1040 hPa</span>
            </div>
          </div>
          <div className="mt-5">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {sparkline.slice(-6).map((value, index, samples) => {
                const previousSample = samples[index - 1] ?? value;
                const sampleDelta = value - previousSample;
                return (
                  <div key={`${value}-${index}`} className="rounded-md border border-white/10 bg-black/20 p-2">
                    <div className="text-[11px] text-slate-500">{index === samples.length - 1 ? "Now" : `-${samples.length - index - 1}h`}</div>
                    <div className="mt-1 text-sm font-bold text-white">{value.toFixed(1)}</div>
                    <div className={`mt-0.5 text-[11px] ${sampleDelta < 0 ? "text-amber" : sampleDelta > 0 ? "text-emerald-200" : "text-slate-500"}`}>
                      {sampleDelta >= 0 ? "+" : ""}{sampleDelta.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
              <span>Model reading: {compactTime(reading.time)}</span>
              <span>{sparkline.length} hourly pressure samples</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm font-bold text-white">What this means</div>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-400">
            <p>{pressureTone} with {trend.toLowerCase()}.</p>
            <p>{location.message}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <div className="text-slate-500">Previous</div>
              <div className="mt-1 font-bold text-white">{reading.previous.toFixed(1)} hPa</div>
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <div className="text-slate-500">Samples</div>
              <div className="mt-1 font-bold text-white">{sparkline.length}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WeatherChanges() {
  const trackers = useAppStore((state) => state.trackers).filter((tracker) => !tracker.archived);
  const weatherTrackers = trackers.filter((tracker) => {
    const haystack = `${tracker.title} ${tracker.kind} ${tracker.source} ${tracker.tags.join(" ")}`.toLowerCase();
    return ["weather", "noaa", "aqi", "fema", "usgs", "transit", "faa", "public-safety", "emergency", "airports"].some((term) => haystack.includes(term));
  });
  const refreshTracker = useAppStore((state) => state.refreshTracker);
  const pushToast = useAppStore((state) => state.pushToast);
  const locationServicesEnabled = useAppStore((state) => state.locationServicesEnabled);
  const setLocationServicesEnabled = useAppStore((state) => state.setLocationServicesEnabled);
  const [selectedLocationId, setSelectedLocationId] = useState("current");
  const [pressureMode, setPressureMode] = useState<PressureMode>("surface");
  const [weatherRefreshKey, setWeatherRefreshKey] = useState(0);
  const [location, setLocation] = useState<LocationState>({ status: "disabled", message: "Location services are off. Choose an example city or enable current location." });
  const [reading, setReading] = useState<WeatherReading>(fallbackWeather);
  const [loading, setLoading] = useState(false);

  const selectedExample = exampleLocations.find((item) => item.id === selectedLocationId);

  useEffect(() => {
    if (selectedExample) {
      setLocation({
        status: "ready",
        latitude: selectedExample.latitude,
        longitude: selectedExample.longitude,
        name: selectedExample.name,
        region: selectedExample.region,
        message: `${selectedExample.name}, ${selectedExample.region}. Focus: ${selectedExample.focus}.`,
      });
      return;
    }

    if (!locationServicesEnabled) {
      setLocation({ status: "disabled", message: "Location services are off. Choose an example city or enable current location." });
      setReading(fallbackWeather);
      return;
    }
    if (!navigator.geolocation) {
      setLocation({ status: "error", message: "This browser does not expose geolocation." });
      return;
    }

    let cancelled = false;
    setLocation({ status: "loading", message: "Requesting current browser location..." });
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (cancelled) return;
        setLocation({
          status: "ready",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          name: "Current location",
          region: "Browser geolocation",
          message: `Using ${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)} within ${Math.round(position.coords.accuracy)}m.`,
        });
      },
      (error) => {
        if (cancelled) return;
        setLocation({ status: "error", message: error.message || "Location permission was not granted." });
      },
      { enableHighAccuracy: false, maximumAge: 60 * 1000, timeout: 10000 },
    );

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [locationServicesEnabled, selectedExample]);

  useEffect(() => {
    if (location.status !== "ready") return;
    const controller = new AbortController();
    const loadWeather = async () => {
      setLoading(true);
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(location.latitude));
        url.searchParams.set("longitude", String(location.longitude));
        url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m");
        url.searchParams.set("hourly", "surface_pressure,pressure_msl");
        url.searchParams.set("temperature_unit", "fahrenheit");
        url.searchParams.set("wind_speed_unit", "mph");
        url.searchParams.set("precipitation_unit", "inch");
        url.searchParams.set("past_days", "1");
        url.searchParams.set("forecast_days", "1");
        url.searchParams.set("timezone", "auto");
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Weather API returned ${response.status}`);
        const data = await response.json() as {
          current?: {
            time?: string;
            temperature_2m?: number;
            relative_humidity_2m?: number;
            apparent_temperature?: number;
            precipitation?: number;
            rain?: number;
            weather_code?: number;
            surface_pressure?: number;
            pressure_msl?: number;
            wind_speed_10m?: number;
            wind_direction_10m?: number;
            wind_gusts_10m?: number;
          };
          hourly?: { time?: string[]; surface_pressure?: Array<number | null>; pressure_msl?: Array<number | null> };
        };
        const hourlyTimes = data.hourly?.time ?? [];
        const hourlyPressures = pressureMode === "surface" ? data.hourly?.surface_pressure ?? [] : data.hourly?.pressure_msl ?? [];
        const values = closestPressureValues(hourlyTimes, hourlyPressures, data.current?.time);
        const current = pressureMode === "surface"
          ? data.current?.surface_pressure ?? values.at(-1) ?? fallbackWeather.current
          : data.current?.pressure_msl ?? values.at(-1) ?? fallbackWeather.current;
        const previous = values.at(-4) ?? values.at(-2) ?? fallbackWeather.previous;
        setReading({
          current,
          previous,
          values,
          time: data.current?.time,
          temperature: data.current?.temperature_2m,
          apparent: data.current?.apparent_temperature,
          humidity: data.current?.relative_humidity_2m,
          precipitation: data.current?.precipitation,
          rain: data.current?.rain,
          windSpeed: data.current?.wind_speed_10m,
          windGust: data.current?.wind_gusts_10m,
          windDirection: data.current?.wind_direction_10m,
          code: data.current?.weather_code,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setReading(fallbackWeather);
          pushToast({ title: "Weather data unavailable", body: error instanceof Error ? error.message : "Weather request failed.", tone: "warning" });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadWeather();
    return () => controller.abort();
  }, [location, pressureMode, pushToast, weatherRefreshKey]);

  const topStats = useMemo(
    () => [
      { icon: ThermometerSun, label: "Temperature", value: reading.temperature === undefined ? "--" : `${Math.round(reading.temperature)}F`, detail: reading.apparent === undefined ? "feels like --" : `feels ${Math.round(reading.apparent)}F` },
      { icon: Wind, label: "Wind", value: reading.windSpeed === undefined ? "--" : `${Math.round(reading.windSpeed)} mph`, detail: reading.windGust === undefined ? "gust --" : `gust ${Math.round(reading.windGust)} mph` },
      { icon: Droplets, label: "Humidity", value: reading.humidity === undefined ? "--" : `${Math.round(reading.humidity)}%`, detail: `${weatherLabel(reading.code)}` },
      { icon: CloudRain, label: "Precipitation", value: reading.precipitation === undefined ? "--" : `${reading.precipitation.toFixed(2)} in`, detail: reading.rain === undefined ? "rain --" : `rain ${reading.rain.toFixed(2)} in` },
    ],
    [reading],
  );

  function refreshWeatherSignals() {
    setWeatherRefreshKey((value) => value + 1);
    weatherTrackers.slice(0, 4).forEach((tracker) => refreshTracker(tracker.id));
    pushToast({ title: "Weather signals refreshed", body: "Weather, AQI, transit, and public safety sources were checked locally.", tone: "info" });
  }

  function toggleLocationServices() {
    const next = !locationServicesEnabled;
    setSelectedLocationId("current");
    setLocationServicesEnabled(next);
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Weather Changes"
        title="A cleaner weather operations desk for pressure, location, and risk changes."
        body="Use your current location or jump between example cities to review pressure movement, wind, precipitation, humidity, and weather-linked operational signals."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant={locationServicesEnabled ? "secondary" : "primary"} icon={<MapPin className="h-4 w-4" />} onClick={toggleLocationServices}>
              Location {locationServicesEnabled ? "on" : "off"}
            </Button>
            <Button variant="secondary" icon={<RadioTower className="h-4 w-4" />} onClick={refreshWeatherSignals}>
              Refresh signals
            </Button>
            <Link to="/app/monitoring" className="inline-flex min-h-10 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 px-4 text-sm font-bold text-cyan transition hover:bg-cyan/15">
              Add source
            </Link>
          </div>
        }
      />

      <section className="panel rounded-lg p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Navigation className="h-4 w-4 text-cyan" />
            Weather source controls
          </div>
          <div className="text-xs text-slate-500">{location.status === "ready" ? `${location.name} / ${location.region}` : location.message}</div>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <label className="min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Location</span>
            <select value={selectedLocationId} onChange={(event) => setSelectedLocationId(event.target.value)} className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan/40">
              <option value="current">Current browser location</option>
              {exampleLocations.map((item) => (
                <option key={item.id} value={item.id}>{item.name} - {item.region}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Atmospheric pressure</span>
            <select value={pressureMode} onChange={(event) => setPressureMode(event.target.value as PressureMode)} className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan/40">
              <option value="surface">Surface pressure</option>
              <option value="sea-level">Sea-level pressure</option>
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-4">
        {topStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <PressureBarometer reading={reading} location={location} loading={loading} mode={pressureMode} />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid content-start gap-4">
          <section className="grid items-start gap-3 md:grid-cols-4">
            {weatherSignals.map((signal) => (
              <div key={signal.label} className="panel min-h-0 self-start rounded-lg p-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <signal.icon className={`h-4 w-4 shrink-0 ${signal.tone}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-slate-400">{signal.label}</div>
                    <div className="mt-0.5 text-xs text-slate-500">24h change</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black leading-none text-white">{signal.value}</div>
                    <div className="mt-1 text-xs font-bold text-cyan">{signal.delta}</div>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-cyan" style={{ width: `${Math.min(92, Number(signal.value) * 7 + 18)}%` }} />
                </div>
              </div>
            ))}
          </section>

          <section className="panel rounded-lg p-4">
            <div className="mb-5 flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-cyan" />
              <h2 className="text-2xl font-black text-white">Tracked weather sources</h2>
            </div>
            <div className="grid gap-3">
              {weatherTrackers.map((tracker) => (
                <article key={tracker.id} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                  <div className="grid gap-3 md:grid-cols-[1fr_210px] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-white">{tracker.title}</h3>
                        <span className={`rounded border px-2 py-0.5 text-[11px] ${severityClass(tracker.severity)}`}>{tracker.severity}</span>
                        <span className="rounded border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] font-bold text-slate-300">{tracker.interval}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-400">{tracker.source}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tracker.tags.map((tag) => (
                          <span key={tag} className="rounded border border-cyan/20 bg-cyan/10 px-2 py-1 text-xs text-cyan">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <SourceStatus title={tracker.title} health={tracker.health} interval={tracker.interval} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <section className="panel rounded-lg p-4">
            <div className="mb-4 flex items-center gap-2 font-bold text-white">
              <MapPin className="h-4 w-4 text-cyan" />
              Regional change board
            </div>
            <div className="grid gap-3">
              {regionalChanges.map(([region, body, severity]) => (
                <div key={region} className="border-l border-white/10 pl-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white">{region}</span>
                    <span className={`rounded border px-2 py-0.5 text-[11px] ${severityClass(severity as "low" | "medium" | "high" | "critical")}`}>{severity}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="panel rounded-lg p-4">
            <Compass className="mb-4 h-5 w-5 text-amber" />
            <h3 className="font-bold text-white">Weather trigger policy</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Escalate when pressure movement intersects with outage zones, transit corridors, school closures, flights, or saved workspace locations.</p>
          </section>

          <section className="panel rounded-lg p-4">
            <CloudRain className="mb-4 h-5 w-5 text-cyan" />
            <h3 className="font-bold text-white">Recent weather-linked events</h3>
            <div className="mt-3 grid gap-3">
              {signalEvents.slice(2, 8).map((event) => (
                <div key={event.id} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                  <div className="font-semibold text-white">{event.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{event.source} - {event.timestamp}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
