# Architecture

```mermaid
flowchart LR
  Browser[React Vite Workspace] --> API[Fastify API]
  Browser <-->|WebSocket| API
  API --> Prisma[Prisma ORM]
  Prisma --> Postgres[(PostgreSQL)]
  API --> Redis[(Redis cache and rate limits)]
  API --> Workers[Monitoring workers]
  Workers --> Sources[Websites, RSS, APIs, GitHub, alerts]
  Workers --> Snapshots[(Snapshot store)]
```

## Frontend

The frontend uses route-level product surfaces with persisted Zustand state for workspace preferences, command history, trackers, alert toggles, and panel layouts.

## Backend

Fastify handles validated REST endpoints, WebSocket events, secure headers, CSRF, rate limits, compression, and auth helpers.

## Database

Prisma models preserve relational ownership and indexed access paths for users, boards, trackers, snapshots, alerts, notifications, audit logs, and analytics rollups.

## Scaling path

- Move monitoring execution into worker queues
- Store snapshot artifacts in object storage
- Use Redis streams for event fan-out
- Add tenant-scoped row access policies
- Promote analytics rollups into scheduled jobs
