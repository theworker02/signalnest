# Deployment Guide

## Build

```bash
npm install
npm run build
```

## Environment

Required variables are listed in `frontend/.env.example` and `backend/.env.example`.

Use unique production values for:

- `VITE_API_URL`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `WEB_ORIGIN`
- `BILLING_ENABLE_LIVE_CHECKOUT`
- `BILLING_PROVIDER_NAME`
- `BILLING_SKILL_CHECKOUT_URL`
- `BILLING_DEVELOPER_SUBSCRIPTION_URL`

## Database

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
```

## Reverse proxy

The nginx config in `nginx/default.conf` proxies `/api` and WebSocket upgrades to the backend while applying hardened headers.

## Observability

Recommended production telemetry:

- API request latency and error rates
- WebSocket connection counts
- Tracker execution duration
- Snapshot storage growth
- Alert delivery success and retry counts
- Authentication and audit events
