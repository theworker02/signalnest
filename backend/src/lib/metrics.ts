type CounterName =
  | "signalnest_http_requests_total"
  | "signalnest_tracker_refresh_total"
  | "signalnest_alert_delivery_failures_total"
  | "signalnest_snapshots_total";

type GaugeName =
  | "signalnest_websocket_connections"
  | "signalnest_tracker_lag_seconds"
  | "signalnest_active_trackers";

const counters = new Map<CounterName, number>();
const gauges = new Map<GaugeName, number>();
const requestStatus = new Map<string, number>();

export function incrementCounter(name: CounterName, amount = 1) {
  counters.set(name, (counters.get(name) ?? 0) + amount);
}

export function incrementHttpStatus(statusCode: number) {
  const key = String(statusCode);
  requestStatus.set(key, (requestStatus.get(key) ?? 0) + 1);
  incrementCounter("signalnest_http_requests_total");
}

export function setGauge(name: GaugeName, value: number) {
  gauges.set(name, value);
}

export function incrementGauge(name: GaugeName, amount = 1) {
  gauges.set(name, (gauges.get(name) ?? 0) + amount);
}

export function renderMetrics() {
  const lines: string[] = [
    "# HELP signalnest_http_requests_total Total HTTP requests handled by the API.",
    "# TYPE signalnest_http_requests_total counter",
  ];

  for (const [status, value] of requestStatus) {
    lines.push(`signalnest_http_requests_total{status="${status}"} ${value}`);
  }

  for (const [name, value] of counters) {
    if (name === "signalnest_http_requests_total") continue;
    lines.push(`# TYPE ${name} counter`);
    lines.push(`${name} ${value}`);
  }

  for (const [name, value] of gauges) {
    lines.push(`# TYPE ${name} gauge`);
    lines.push(`${name} ${value}`);
  }

  return `${lines.join("\n")}\n`;
}

export function resetMetrics() {
  counters.clear();
  gauges.clear();
  requestStatus.clear();
}
