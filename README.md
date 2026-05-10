# SignalNest

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=111)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5-111827?logo=fastify&logoColor=white)
![License](https://img.shields.io/badge/License-Apache%202.0-blue)
![Status](https://img.shields.io/badge/Status-local%20prototype-cyan)

SignalNest is a premium personal internet intelligence workspace for monitoring the modern internet without turning the product into a chatbot. It combines signal boards, trackers, change detection, alerts, research vaults, developer APIs, custom skills, and operational dashboards into one dense, polished application.

The product is designed for people who need to notice meaningful changes early: price shifts, release notes, website diffs, outages, weather alerts, public notices, GitHub activity, social movement, cybersecurity signals, and API responses.

## Contents

- [Product Vision](#product-vision)
- [Feature Map](#feature-map)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Environment Files](#environment-files)
- [Scripts](#scripts)
- [API CLI](#api-cli)
- [Release Artifacts](#release-artifacts)
- [Deployment Notes](#deployment-notes)
- [API Surface](#api-surface)
- [Marketplace And Custom Skills](#marketplace-and-custom-skills)
- [Developer Console](#developer-console)
- [Documentation Routes](#documentation-routes)
- [Security Notes](#security-notes)
- [Database And Monitoring](#database-and-monitoring)
- [Testing](#testing)
- [Project Policy](#project-policy)
- [License](#license)

## Product Vision

SignalNest is not a social network, a generic productivity board, or a mock analytics shell. The core unit of the product is a **signal**: a meaningful change captured from a source the user cares about.

Examples of signals include:

- A competitor pricing page changes.
- A tracked API starts returning a different JSON field.
- A GitHub repository publishes a new release.
- A city alert feed posts a new emergency notice.
- A product comes back in stock.
- A weather source reports severe conditions.
- A status page moves from operational to degraded.
- A public document or policy page changes language.

Signals can be collected by trackers, marketplace skills, API integrations, custom scripts, or manual research. Once captured, they can be routed into boards, alerts, timelines, maps, vault entries, and analytics views.

The interface is intentionally dark, dense, keyboard friendly, and operational. The design inspiration sits closer to Linear, Arc, Raycast, Vercel, Bloomberg-style dashboards, and modern security tooling than to a traditional SaaS landing page.

## Feature Map

| Area | Purpose |
| --- | --- |
| Landing | Introduces the platform and previews real app screens. |
| Dashboard | Summarizes workspace health, signal activity, and active systems. |
| Monitoring | Creates and manages tracker-like signal sources. |
| Change Engine | Shows website, text, price, and outage detection workflows. |
| Signal Map | Visualizes related entities with graph-based interaction. |
| Research Vault | Stores links, notes, screenshots, saved research, and tags. |
| Alerts | Creates and reviews threshold or status-based alert rules. |
| Workspace | Demonstrates multi-panel operational layouts. |
| Analytics | Shows usage, activity, signal distribution, and trend views. |
| Settings | Controls theme, density, sound, notifications, shortcuts, and layout preferences. |
| Security | Summarizes account and session safety concepts. |
| Skills | Hosts the marketplace and custom skill builder. |
| Developers | Provides API keys, webhooks, request logs, usage, docs, and pricing. |
| Docs | Provides multi-page API and developer documentation. |
| Auth | Provides login and signup routes. |

## Architecture

SignalNest is a TypeScript monorepo with three npm workspaces:

- `frontend`: React, Vite, Tailwind, Framer Motion, Zustand, TanStack Query, D3, React Flow, and Lucide React.
- `backend`: Node.js, Fastify, Zod, security plugins, rate limiting, WebSockets, metrics, PostgreSQL wiring, and Redis wiring.
- `shared`: `@signalnest/sdk`, an ESM SDK package with a terminal CLI.

The current project is a functional local prototype. The UI, routes, local state flows, API foundation, SDK, CLI, release artifacts, documentation pages, and tests are present. A full production deployment still needs durable database persistence, background workers, billing fulfillment, hardened auth, and real hosted secret management before accepting customers.

## Project Structure

```text
signalnest/
├── .github/          GitHub workflow and repository automation files
├── backend/          Fastify API workspace
├── database/         SQL schema, indexes, retention, and seed data
├── docker/           Container support files
├── docs/             API, architecture, deployment, and production docs
├── frontend/         React/Vite application workspace
├── infrastructure/   Infrastructure notes and deployment support
├── monitoring/       Metrics and dashboard support assets
├── nginx/            Reverse proxy configuration
├── release/          Generated release archives and checksums
├── scripts/          Environment, seed, cleanup, and release scripts
├── shared/           SDK and CLI workspace
└── tests/            API, repository, SDK, security, and utility tests
```

Generated build outputs, local logs, environment files, QA screenshots, and release staging files are intentionally ignored by Git.

## Requirements

- Node.js `22` or newer.
- npm with workspace support.
- A modern browser for the frontend.
- PowerShell on Windows for ZIP artifact generation.
- `zip` on macOS/Linux for ZIP artifact generation.
- Optional PostgreSQL for database script usage.
- Optional Redis for cache and coordination wiring.
- Optional Docker Desktop for compose-based infrastructure.

## Quick Start

```bash
npm install
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
npm run dev
```

Open the frontend at:

```text
http://127.0.0.1:5173
```

Check API health at:

```text
http://127.0.0.1:4040/api/health
```

The root `npm run dev` command starts the frontend and backend together. Use `Ctrl+C` to stop both processes.

## Environment Files

SignalNest uses split environment files so browser-visible values and server-only secrets do not get mixed.

| File | Purpose |
| --- | --- |
| `.env` | Root pointer/local convenience file only. Do not store production secrets here. |
| `frontend/.env` | Frontend Vite values that may be exposed to the browser. |
| `frontend/.env.example` | Committed frontend environment template. |
| `backend/.env` | Server-only values such as database URLs, Redis URLs, JWT secrets, and billing URLs. |
| `backend/.env.example` | Committed backend environment template. |

Important rules:

- Do not commit `.env` files.
- Do not place backend secrets in `frontend/.env`.
- Do not expose JWT secrets, database URLs, Redis URLs, or hosted billing secrets to the frontend.
- Use separate secrets for development, staging, and production.
- Rotate local secrets before any public deployment.

## Scripts

### Root Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts frontend and backend together. |
| `npm run dev:frontend` | Starts only the Vite frontend. |
| `npm run dev:backend` | Starts only the Fastify API. |
| `npm run build` | Builds SDK, frontend, and backend. |
| `npm run typecheck` | Runs TypeScript checks across all workspaces. |
| `npm run lint` | Runs frontend ESLint. |
| `npm test` | Runs the Node test suite. |
| `npm run api -- help` | Prints CLI help. |
| `npm run check:env` | Validates environment readiness. |
| `npm run db:seed` | Runs the database seed helper. |
| `npm run clean` | Removes local generated artifacts. |
| `npm run release` | Builds and packages release artifacts. |
| `npm run release:artifacts` | Packages artifacts from existing build output. |

### Frontend Scripts

```bash
npm run dev --workspace frontend
npm run build --workspace frontend
npm run preview --workspace frontend
npm run typecheck --workspace frontend
npm run lint --workspace frontend
```

The frontend build output is `frontend/dist`. The site release artifact packages this output as `public/`.

### Backend Scripts

```bash
npm run dev --workspace backend
npm run build --workspace backend
npm run start --workspace backend
npm run typecheck --workspace backend
```

The backend build output is `backend/dist`. The API release artifact packages this compiled output with backend metadata, SQL assets, and documentation.

### SDK Scripts

```bash
npm run build --workspace @signalnest/sdk
npm run typecheck --workspace @signalnest/sdk
```

The SDK build output is `shared/dist`. The SDK release artifact packages the compiled SDK and CLI entrypoint.

## API CLI

The CLI talks to the backend API from a terminal.

```bash
npm run api -- health
npm run api -- trackers list --limit 20
npm run api -- trackers create --title "Competitor pricing" --kind website --source https://example.com/pricing
npm run api -- trackers refresh --id TRACKER_ID
npm run api -- trackers archive --id TRACKER_ID
npm run api -- alerts list
npm run api -- alerts create --name "High severity move" --condition "severity = high" --priority high
npm run api -- init-env
npm run api -- docs
```

The CLI reads these environment variables:

```bash
SIGNALNEST_API_URL=http://127.0.0.1:4040/api
SIGNALNEST_API_KEY=sn_live_key_replace_me
```

To link the CLI locally:

```bash
npm run build --workspace @signalnest/sdk
npm link --workspace @signalnest/sdk
signalnest health
```

## Release Artifacts

Run:

```bash
npm run release
```

This builds the SDK, frontend, and backend, then writes release files into `release/`.

| Artifact | Contents |
| --- | --- |
| `signalnest-*-site.zip` | Static frontend build, nginx config, deployment docs, production checklist, license, and README. |
| `signalnest-*-api.zip` | Compiled Fastify API, backend package metadata, backend env template, SQL assets, API docs, architecture docs, Dockerfile, license, and README. |
| `signalnest-*-sdk-cli.zip` | Compiled SDK, CLI executable entry, package metadata, SDK README, and license. |
| `release-manifest.json` | Machine-readable summary of generated artifacts. |
| `SHA256SUMS.txt` | SHA-256 checksum list for archive verification. |

Use `npm run release:artifacts` only when build outputs already exist and you only need to repackage them.

## Deployment Notes

### Site Artifact

1. Unzip the site artifact.
2. Serve the `public/` directory with a static web server.
3. Configure SPA fallback so application routes return `index.html`.
4. Use the included `nginx/` config as a starting point.
5. Use HTTPS, compression, and long cache headers for hashed assets.
6. Keep HTML cache headers short so deployments roll forward cleanly.

### API Artifact

1. Unzip the API artifact.
2. Install production dependencies in the backend package context.
3. Configure `backend/.env`.
4. Run database setup if PostgreSQL is enabled.
5. Start the server with `node backend/dist/server.js`.
6. Place the API behind a reverse proxy.
7. Use strict CORS origins, secure cookies, real JWT secrets, and production rate limits.

## API Surface

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Returns API health. |
| `GET` | `/api/metrics` | Returns operational metrics. |
| `GET` | `/api/trackers` | Lists trackers. |
| `POST` | `/api/trackers` | Creates a tracker. |
| `POST` | `/api/trackers/:id/refresh` | Refreshes one tracker. |
| `POST` | `/api/trackers/:id/archive` | Archives one tracker. |
| `GET` | `/api/alerts` | Lists alert rules. |
| `POST` | `/api/alerts` | Creates an alert rule. |
| `POST` | `/api/auth/login` | Handles local login behavior. |
| `POST` | `/api/auth/register` | Handles signup behavior. |
| `POST` | `/api/checkout/skill` | Creates a hosted skill checkout response when configured. |
| `POST` | `/api/checkout/developer-subscription` | Creates developer subscription checkout when configured. |

See `docs/API.md` for deeper API notes.

## Marketplace And Custom Skills

The marketplace installs free signal packs into local workspace state. These skills can add monitors, alert rules, vault notes, and workflow shortcuts.

Current marketplace concepts include:

- API connector skills that model calls to external REST APIs.
- Weather API skills that compare multi-provider conditions.
- Price watcher skills for retail, SaaS, hotels, flights, hardware, subscriptions, tickets, and markets.
- Security, civic, legal, infrastructure, research, and local monitoring packs.

The custom skill builder supports:

- Skill name.
- Skill goal.
- Trigger style.
- JavaScript, Python, and C# examples.
- A code box for custom implementation logic.
- A local security scan before the skill can be saved.
- Vault-note storage for saved scripts.

The security scanner blocks obvious harmful patterns, but it is a guardrail rather than a production sandbox. Production custom code execution should use true isolation, resource limits, audit logging, and dependency controls.

## Developer Console

The developer area includes:

- Overview cards.
- API key generation.
- One-time API secret reveal behavior.
- Subscription gating after the first API key.
- Webhook generation.
- Request logs.
- Usage and analytics panels.
- Environment variable guidance.
- API documentation links.
- API pricing at `/app/pricing-api`.

## Documentation Routes

| Route | Purpose |
| --- | --- |
| `/app/developers/docs` | Documentation overview. |
| `/app/developers/docs/quickstart` | First API request walkthrough. |
| `/app/developers/docs/authentication` | Auth and API key guidance. |
| `/app/developers/docs/api-keys` | API key management. |
| `/app/developers/docs/webhooks` | Webhook setup and events. |
| `/app/developers/docs/trackers` | Tracker API usage. |
| `/app/developers/docs/alerts` | Alert API usage. |
| `/app/developers/docs/workspaces` | Workspace concepts. |
| `/app/developers/docs/change-detection` | Change detection guide. |
| `/app/developers/docs/research-vault` | Vault guide. |
| `/app/developers/docs/skills` | Skills and marketplace guide. |
| `/app/developers/docs/sdk` | SDK usage. |
| `/app/developers/docs/cli` | Terminal CLI usage. |
| `/app/developers/docs/pagination` | Pagination conventions. |
| `/app/developers/docs/rate-limits` | Rate limit behavior. |
| `/app/developers/docs/errors` | Error response conventions. |
| `/app/developers/docs/changelog` | API changelog. |
| `/app/developers/docs/api-reference` | API reference. |

## Security Notes

The backend uses Fastify security plugins, secure headers, request validation, rate limiting, CORS configuration, compression, CSRF protection hooks, WebSocket support, and typed token helpers.

Before public deployment:

- Replace development secrets.
- Use a production identity provider or hardened auth implementation.
- Store API secrets encrypted.
- Verify webhook signatures.
- Use strict CORS origins.
- Add durable audit logging.
- Add background worker isolation.
- Add true sandboxing for user-provided code.
- Review CSP and cookie behavior.

See `SECURITY.md` for the current security reporting stance.

## Database And Monitoring

The database assets model the expected relational foundation:

- Users
- Workspaces
- Boards
- Trackers
- Alerts
- Snapshots
- Notifications
- Sessions
- Feeds
- Saved items
- Analytics
- Settings

SQL assets live in `database/`:

- `001_core_indexes.sql`
- `retention.sql`
- `seed.sql`

Operational health should be checked through `/api/health`, and metrics should be scraped from `/api/metrics`. Production deployments should also monitor database availability, Redis availability, worker throughput, webhook retries, alert dedupe behavior, and release checksum traceability.

## Testing

Run these before releasing:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run release
```

For UI changes, also verify desktop, mobile, deep links, route transitions, keyboard flows, marketplace interactions, developer docs, and browser console output.

For API changes, verify request logs, health checks, metrics, CLI behavior, SDK behavior, and tests in `tests/`.

## Project Policy

SignalNest is not currently seeking outside contributions. Pull requests, feature requests, and external security submissions may not be reviewed or triaged.

See:

- `CONTRIBUTING.md`
- `SECURITY.md`

## License

SignalNest is licensed under the Apache License 2.0. See `LICENSE` for the complete license text.
