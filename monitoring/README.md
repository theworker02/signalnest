# Monitoring

Files in this directory:

- `prometheus.yml`: local Prometheus scrape configuration.
- `signalnest-alerts.yml`: alert rules for API health, websocket health, tracker lag, and alert delivery.
- `grafana-dashboard.json`: starter dashboard for operational visibility.

The backend exposes `/api/metrics` in Prometheus text format. The current exporter includes HTTP status counts, websocket connections, active trackers, tracker refresh count, tracker lag, alert delivery failures, and snapshot counts.

Docker Compose starts Prometheus on `http://localhost:9090` and Grafana on `http://localhost:3001`.
