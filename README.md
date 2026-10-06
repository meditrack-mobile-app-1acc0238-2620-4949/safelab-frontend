# SafeLab Frontend

SafeLab Frontend Web Application built with Vue 3, Vite, Pinia, Vue Router, PrimeVue and Vue I18n. This version is configured to consume the deployed SafeLab backend in Render.

## Backend integration

The frontend uses this API by default:

```env
VITE_API_BASE_URL=https://safelab-platform-api.onrender.com/api/v1
```

The app no longer depends on JSON Server as its primary source. It loads the shared backend state from:

```text
GET /api/v1/demo/state
```

Then all main operations call the backend endpoints:

- Sensors: `GET /sensors`, `POST /sensor-monitoring/sensors`, `PATCH /sensor-monitoring/sensors/{id}/reading`, `DELETE /sensors/{id}`
- Assets: `POST/PATCH/DELETE /asset-inventory/assets`
- Alerts: `POST /alerts-notifications/alerts/{id}/acknowledge`, `resolve`, `escalate`
- Remote Control: `POST /remote-control/actuators/{id}/commands`
- Incidents: `POST /incident-management/incidents/{id}/start-investigation`, `mark-resolved`, `close`
- Reports: `POST /reports-analytics/reports/generate`
- Audit: loaded through `GET /audit-traceability/timeline` and backend shared state

If the backend is temporarily unavailable, the frontend keeps a local fallback cache so the demo does not break visually.

## Demo credentials

```text
admin@safelab.pe / 123456
coordinator@labcentral.pe / 123456
technician@labcentral.pe / 123456
compliance@farmaciaregional.pe / 123456
manager@labcentral.pe / 123456
pharma@pharmandina.pe / 123456
```

## Local development

```bash
npm install
npm run dev
```

Optional `.env.local`:

```env
VITE_API_BASE_URL=https://safelab-platform-api.onrender.com/api/v1
VITE_APP_NAME=SafeLab
VITE_DEFAULT_LOCALE=en
VITE_USE_REMOTE_API=true
```

To force offline demo mode:

```env
VITE_USE_REMOTE_API=false
```

## Build

```bash
npm run build
npm run preview
```

## Deploy on Render as Static Site

Recommended Render configuration:

```text
Type: Static Site
Name: safelab-frontend
Branch: main
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment variables:

```text
VITE_API_BASE_URL=https://safelab-platform-api.onrender.com/api/v1
VITE_APP_NAME=SafeLab
VITE_DEFAULT_LOCALE=en
VITE_USE_REMOTE_API=true
```

For Vue Router history mode, configure a rewrite rule in Render:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

This repository also includes `render.yaml` with the same static site configuration.

## Important CORS note

After Render gives you the final frontend URL, update the backend environment variable:

```text
CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com,http://localhost:5173
```

Then redeploy the backend.

## Stack

- Vue 3 + Vite
- Vue Router
- Pinia
- PrimeVue + PrimeFlex + PrimeIcons
- Vue I18n
- Axios
- Render Static Site deployment
- SafeLab Platform API backend deployed on Render

## Project Structure

```text
safelab-frontend/
├── public/
├── server/                         # legacy mock seed, not required for deployed mode
├── src/
│   ├── assets/
│   ├── locales/
│   ├── router/
│   ├── shared/
│   ├── identity-access/
│   ├── user-profiles/
│   ├── subscription-billing/
│   ├── dashboard-overview/
│   ├── asset-inventory/
│   ├── sensor-monitoring/
│   ├── environmental-compliance/
│   ├── alerts-notifications/
│   ├── remote-control/
│   ├── reports-analytics/
│   ├── incident-management/
│   └── audit-traceability/
├── .env.example
├── .env.production.example
├── render.yaml
├── package.json
└── vite.config.js
```

## DDD Frontend Convention

Each bounded context keeps the same structure:

```text
application/      use cases, services and stores
domain/           entities, models and constants
infrastructure/   API clients, repositories and mappers
presentation/     routes, views and UI components
```

## Bounded Contexts

1. `identity-access`
2. `user-profiles`
3. `subscription-billing`
4. `dashboard-overview`
5. `asset-inventory`
6. `sensor-monitoring`
7. `environmental-compliance`
8. `alerts-notifications`
9. `remote-control`
10. `reports-analytics`
11. `incident-management`
12. `audit-traceability`


## Vercel deployment

This frontend is prepared for Vercel as a Vite static application.

Recommended settings:

```txt
Framework Preset: Vite
Root Directory: empty
Install Command: npm install --legacy-peer-deps
Build Command: npm run build
Output Directory: dist
```

Required environment variables:

```env
VITE_API_BASE_URL=https://safelab-platform-api.onrender.com/api/v1
VITE_APP_NAME=SafeLab
VITE_DEFAULT_LOCALE=es
VITE_USE_REMOTE_API=true
```

After deployment, add the final Vercel URL to the backend `CORS_ALLOWED_ORIGINS` variable in Render and redeploy the backend.

## Vercel deployment note

If Vercel fails with `npm error Exit handler never called!`, use pnpm instead of npm:

```txt
Install Command: corepack enable && pnpm install --no-frozen-lockfile
Build Command: pnpm run build
Output Directory: dist
```

This project declares `packageManager: pnpm@10.14.0` and Node 24 for Vercel builds.


## Deploy rápido en Vercel con Bun

Usar Bun evita los errores de npm/pnpm vistos en el build cloud.

```txt
Framework Preset: Vite
Install Command: bun install
Build Command: bun run build
Output Directory: dist
```

Variables requeridas:

```env
NODE_VERSION=24
VITE_API_BASE_URL=https://safelab-platform-api.onrender.com/api/v1
VITE_APP_NAME=SafeLab
VITE_DEFAULT_LOCALE=es
VITE_USE_REMOTE_API=true
```
