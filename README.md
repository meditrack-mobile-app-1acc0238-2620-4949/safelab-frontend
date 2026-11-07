# SafeLab — Web Frontend

The web application for **SafeLab**, an academic clinical cold-chain monitoring platform serving clinical laboratories and pharmaceutical companies. Built with Vue 3, Vite, Pinia and Vue I18n. Its Bounded Context terminology is shared with the SafeLab Android application.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
```

Run the bundled JSON dataset in one terminal:

```bash
npm run server
```

Start the web UI in another terminal:

```bash
npm run dev
```

Visit the URL printed by Vite (usually `http://localhost:5173`). JSON Server runs at `http://localhost:3000`. The app also includes a local seed so its basic views are available without JSON Server.

## Platform, company and employee experiences

| Audience | Start page | Scope |
| --- | --- | --- |
| SafeLab administrator | Platform overview | All registered organizations; drill into company users, devices, subscriptions and operations |
| General manager | Operations dashboard and **Users & Permissions** | Own organization; employee invitations, role-based switches with Save/Cancel, assignments and subscription |
| Employees | Operations dashboard | Authorized BCs, assigned facilities and devices only |

All interfaces preserve the SafeLab light/dark themes and English/Spanish localization. The sidebar displays short navigation labels, while the code follows the original 12 DDD Bounded Contexts.

### Platform administration

The platform administrator has a distinct navigation and can review all three companies:

- **Overview:** global KPIs, organization health, alerts, invoice totals and recent audit events.
- **Organizations:** segment/status filters, company details and scoped users, devices, billing and operations.
- **Global users:** user status and role filters, account summaries and organization links.
- **Subscriptions:** plan totals, employee seat use, additional contracted seats and upcoming invoices.
- **Activity & audit:** searchable audit events, severity/status badges and event timeline.
- **Settings:** platform contact details and notification preferences, saved locally with Save/Cancel. Security and plan policies are shown from the current frontend configuration.

Summary cards use the same local records as the detailed tables, and all platform tables support CSV exports. The updated UI uses the same light/dark theme variables and EN/ES dictionaries.


## Local test accounts

The following accounts are **fictional and active**, and use the same local test password: `SafeLab2026%`.

| Account | Email | Role |
| --- | --- | --- |
| SafeLab Platform | `admin@safelab.test` | Platform Administrator |
| Laboratorios Andinos | `gerente.andes@safelab.test` | General Manager |
| Centro Clínico San Gabriel | `gerente.gabriel@safelab.test` | General Manager |
| Farmacéutica Andina | `gerente.farma@safelab.test` | General Manager |
| Andinos | `bioclinical-coordinator1.andes@safelab.test` | Bioclinical Coordinator |
| San Gabriel | `lab-technician2.gabriel@safelab.test` | Laboratory Technician |
| FarmaAndina | `pharma-operations-coordinator1.farma@safelab.test` | Pharmaceutical Coordinator |
| FarmaAndina | `pharma-technician2.farma@safelab.test` | Pharmaceutical Technician |
| Andinos | `compliance-officer4.andes@safelab.test` | Quality Officer |
| FarmaAndina | `maintenance-operator5.farma@safelab.test` | Maintenance Technician |

All other employee logins appear in `server/db.json`, under `users`. There are **three companies, three general managers, fifteen employees and one platform administrator**. Two companies belong to the laboratory segment and one to pharmaceutical operations. Each company has ten included employee seats; the pharmaceutical company also illustrates two contracted additional seats. General managers do not occupy an employee seat.

### Registration flows

- **Register company**: RUC format/check digit, legal company name, segment, distinct institutional verification email and manager information. A pending organization, manager and subscription are stored locally.
- **Invitation**: a manager creates a personal invitation for a permitted role, organization and assigned resources. Codes expire after 72 hours and reserve a seat. The invited employee provides the matching email and personal information.
- Both account flows generate immutable 18-digit usernames and UUIDs. New accounts remain pending verification or activation until the real backend is implemented.

The 21-permission catalog is defined in `src/boundedcontext/identityaccess/domain/models/permission-catalog.js`. Role defaults and the allowed maximum for each role are distinct. Switch changes are **drafts** until the manager presses **Save changes**. A manager can reset to role defaults, cancel and assign facilities/equipment. Tenants cannot assign global administrator permissions.

## Data and architecture

- Seed and shared relationships: `src/shared/domain/data/safelab-multitenant-seed.js`.
- JSON Server source: `server/db.json`.
- Authentication and accounts: `src/boundedcontext/identityaccess/`.
- Platform and manager dashboards: the IAM presentation layer uses existing stores and shared layouts.
- CSV export: `src/shared/application/services/csv-export.js`, reused for full record tables, reports, company users, subscriptions and platform lists.
- Verification: `node scripts/verify-data.mjs` checks cross-BC and tenant references, roles, seat counts, receipts and permissions.

The 12 BC folders are `identityaccess`, `userprofiles`, `subscriptionbilling`, `facilityassets`, `sensormonitoring`, `equipmentmaintenance`, `environmentalcompliance`, `alertsincidents`, `remoteactuation`, `dashboardinsights`, `reportinganalytics`, and `audittraceability`.

## Limitations and next integration

This is an **offline-first frontend prototype with local fictional data**, not a secure production application. Session/authentication, company validation, permissions, invitations, invoicing, remote actions and email verification are simulated in the browser. The local JSON Server exposes sample data without authentication and must not be deployed publicly. Test passwords are purposely bundled only for local development.

The forthcoming backend must implement password hashing, server-side permission enforcement, company isolation, authorized manager registration, RUC/company verification, corporate email confirmation, single-use invitations, payment webhooks, seat accounting and auditable remote-device authorization. When mobile is updated, both clients should use the same identifiers, role definitions and API contracts.


### SafeLab Platform: resumen y registros completos

El administrador global consulta tarjetas y tablas resumidas en **Empresas**, **Usuarios globales**, **Suscripciones** y **Actividad y auditoría**. Cada resumen abre una vista de registros completos con búsqueda, filtro, paginación, detalle y exportación CSV.

Ruta de ejemplo: `/platform/records/users`. Al consultar una empresa, la navegación utiliza `organizationId` para mostrar únicamente sus registros. Las vistas leen el mismo repositorio local que sus resúmenes y no muestran contraseñas en detalles ni exportaciones.

Estos datos y controles siguen siendo locales; la autorización efectiva deberá aplicarse también en el backend cuando se integre.
