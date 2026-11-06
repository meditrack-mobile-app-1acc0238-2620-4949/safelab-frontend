# SafeLab — Web Frontend

SafeLab is an academic clinical cold-chain monitoring platform for laboratory environments, temperature-sensitive supplies, equipment status and operational traceability. This repository contains the **web application**, built in **Vue 3 and Vite**. Its interface complements the Kotlin/Jetpack Compose Android application.

This release is a **frontend demonstration with fictional data**. It does not require a production backend, Vercel, Render, cloud credentials, email providers, payment gateways or physical IoT devices.

## Local setup

Requirements: Node.js 20+ and npm. Open two terminals in the project root.

```bash
npm install
```

Terminal A — optional local mock data server (recommended):

```bash
npm run server
```

Terminal B — web application:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser. The local JSON Server is available at **http://localhost:3000**. If the JSON Server is not started, the frontend can still use the bundled mock seed.

### Demo account

- Email: `admin@hotmail.com`
- Password: `SafeLab2026%`
- Immutable username: `691339768298838915`

New registrations generate an internal UUID v4 and a random 18-digit username. New accounts remain **pending activation**: no real verification email is sent, no payment occurs, and the account cannot sign in. The administrator is the only active demo login. The browser stores temporary registration and profile data; **this mock authentication is not secure for production**. The eventual backend must own password hashing, authorization, uniqueness constraints, email verification and billing.

## Bounded Contexts

The source code is grouped under `src/boundedcontext/`. Each context keeps its own domain, application, infrastructure (when useful) and presentation code.

| Context | Directory | Responsibility |
| --- | --- | --- |
| Identity & Access Management | `identityaccess` | Login, registration and access checks |
| User Profile Management | `userprofiles` | Personal profile and editable preferences |
| Subscription & Billing | `subscriptionbilling` | Read-only plan, upcoming invoice and payment history |
| Facility & Asset Management | `facilityassets` | Sites, storage areas and registered assets |
| Sensor & Telemetry Monitoring | `sensormonitoring` | Sensor conditions, readings and status |
| Equipment Health & Maintenance | `equipmentmaintenance` | Equipment condition and maintenance records |
| Environmental Compliance Management | `environmentalcompliance` | Environmental rules, evaluations and violations |
| Alert & Incident Management | `alertsincidents` | Alerts, notifications and incident tracking |
| Remote Control & Actuation | `remoteactuation` | Simulated commands and local command history |
| Operational Dashboard & Insights | `dashboardinsights` | Cross-context KPIs and operational summaries |
| Reporting & Analytics | `reportinganalytics` | Reports, trends and exports |
| Audit & Traceability | `audittraceability` | Actor actions and event history |

The same 12 conceptual BCs are shared with the mobile application. User Profiles and Billing are accessed from the account area; IAM is accessed before login. The main navigation contains the operational BCs, while alert and incident views belong to one shared BC.

## Frontend behavior

- **Visuals:** original SafeLab blue-purple dashboard theme, with responsive cards, charts and light/dark mode.
- **Languages:** Spanish and English using `vue-i18n`.
- **Data:** `src/shared/domain/data/safelab-demo-seed.js` and `server/db.json` represent the same sample dataset, including 12 sensors, 10 assets and 4 incidents.
- **Local operations:** mock changes are simulated in the browser. No email, real billing or device commands are executed.
- **Architecture:** routes, stores and views are separated so the infrastructure data sources can later be replaced by backend REST clients.

To validate changes after editing mock data, inspect the shared identifiers across sensors, equipment, facilities, alerts, incidents and compliance evaluations. Database constraints and live APIs will be implemented in the backend phase.

## Development workflow

Use `develop` for integrated frontend work and create new `feature/*` branches from it. Merge tested features into `develop`, then promote stable milestones to `main`. Do not store local credentials, paid API keys or SDK secrets in Git.

## Limitations

This is **not** the finished client/server system. The local server is a development JSON file server, not a production backend. Data and simulated operations are not synchronized across devices. The future backend will provide authoritative authentication, subscriptions, audit persistence, device authorization and data consistency for both Vue Web and Android.

## Complete record views

Cards that summarize records (such as environmental evaluations, command history,
and audit logs) link to a dedicated, full-width records page. The detail pages
reuse the same local data as the dashboards; no new backend is needed.

Select a summary card or its title to view the full list. You can search, filter
by status, move between pages, select a row for details, and export the current
filtered results as CSV. Use **Back** to return to the preceding module.

Both language options and the existing light/dark themes work in these views.
