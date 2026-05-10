# API

Base URL: `/api`

## SDK and terminal CLI

SignalNest includes a local SDK package at `@signalnest/sdk` and a terminal
command named `signalnest`.

Run commands from the repository root during development:

```bash
npm run api -- health
npm run api -- trackers list
npm run api -- trackers create --title "Competitor pricing" --kind website --source https://example.com/pricing --tags pricing,competitor
npm run api -- alerts create --name "Pricing changed" --condition "visual_delta > 12" --priority high
```

Install the CLI onto your terminal path from this checkout:

```bash
npm install
npm run build --workspace @signalnest/sdk
npm link --workspace @signalnest/sdk
signalnest health
```

Environment variables:

```bash
SIGNALNEST_API_URL=http://127.0.0.1:4040/api
SIGNALNEST_API_KEY=sn_live_key_replace_me
```

The local API currently accepts unauthenticated development requests, but
production integrations should send the API key as a bearer token.

## Auth

`POST /api/auth/login`

Creates a local session. During development, an unknown email is provisioned into the in-memory repository; an existing email must provide the original password.

```json
{
  "email": "operator@signalnest.local",
  "password": "at-least-8-characters"
}
```

`POST /api/auth/refresh`

Rotates a refresh token and returns a new access/refresh pair.

## Health

`GET /api/health`

Returns service status and timestamp.

## Trackers

`GET /api/trackers`

Returns paginated tracker summaries.

Query parameters:

- `limit`: 1-100
- `cursor`: previous `nextCursor`
- `includeArchived`: include archived monitors

`POST /api/trackers`

```json
{
  "title": "Competitor pricing",
  "kind": "website",
  "source": "https://example.com/pricing",
  "intervalSeconds": 300,
  "tags": ["pricing", "competitor"]
}
```

## Alerts

`GET /api/alerts`

Returns alert rules.

`POST /api/alerts`

```json
{
  "name": "Pricing changed",
  "condition": "visual_delta > 12",
  "priority": "high",
  "enabled": true
}
```

`PATCH /api/alerts/:id`

Updates an alert rule.

## Current Persistence

The API currently uses a stateful in-memory repository so the routes are usable during local development without requiring PostgreSQL. The Prisma schema is ready for the next step: replacing the repository with database-backed services.

## WebSocket

`GET /api/live`

Streams live `signal.event` messages for dashboards and collaboration surfaces.

## Metrics

`GET /api/metrics`

Returns Prometheus-compatible metrics for HTTP status counts, websocket connections, active trackers, tracker refreshes, tracker lag, alert delivery failures, and snapshot volume.
