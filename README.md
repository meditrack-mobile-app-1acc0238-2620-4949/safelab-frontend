# SafeLab v2.5.0 RC3 — Sincronización móvil y paridad API (2026-11-07)

> **Candidata de validación local.** No crear todavía un tag estable: primero aprobar `npm run build`, compilación Android, tests Maven y pruebas reales PostgreSQL.

## Incidencias corregidas respecto de RC2

- **Mobile:** `GET /api/v1/integration/bootstrap` se vuelve a consultar al cambiar módulo/pestaña o submódulo, y al recuperar el primer plano. Hay un botón **Actualizar datos** y un mensaje de error con opción de reintento; **ya no hace falta cerrar sesión** para obtener cambios de Web. No se implementaron WebSockets ni sincronización push instantánea.
- **Mobile:** las colecciones de **activos** y **sensores** ofrecen editar y eliminar, y **mantenimiento** ofrece editar, cuando el token tiene el permiso correspondiente. El formulario de activos incluye nombre, categoría, sede, ubicación, estado, fecha y responsable existente por ID (solo el gerente). Sensores permiten configuración de umbrales y envío de lectura; eliminaciones piden confirmación y respetan las FK.
- **Mobile:** acciones del backend para reconocer/resolver/escalar alertas, investigar/resolver/cerrar incidentes y activar/pausar reglas de cumplimiento, de acuerdo con los permisos. Se conserva el alta de recursos, invitaciones y asignaciones de RC2.
- **Web + API + Mobile:** los permisos efectivos se publican en el bootstrap autenticado, en vez de que cada interfaz los adivine desde valores simulados. El backend sigue validando permisos en cada endpoint. El backend limita el permiso implícito del gerente a su catálogo oficial y evita recursos sin asignación para roles técnicos.
- **Backend:** HTTP 409 claro al intentar borrar equipos o sensores que conservan referencias clínicas; **V1–V4 de Flyway no se modificaron**. No borrar ni reinicializar `safelab_db`.
- **Relaciones:** se han comprobado las referencias del seed JSON en 11 colecciones sin encontrar IDs inexistentes ni cruces entre organizaciones; no equivale a verificar la base local ya modificada. Ejecutar `database/diagnostics/verify_rc3_relations.sql` en pgAdmin.

## Compatibilidad y límites

**Leer:** los 12 BC siguen consumiendo colecciones autorizadas de Spring Boot.
**Escribir:** sólo existen operaciones reales para endpoints específicos. Las pantallas sin API equivalente continúan siendo de consulta o demostración; no se simula un guardado exitoso. Para detalle consulta `docs/COMPATIBILITY_MATRIX_RC3.md`.
**Sincronización:** al navegar, volver a primer plano o pulsar Actualizar; no es tiempo real continuo mientras ambas pantallas permanecen abiertas.
**Roles:** 403 del backend es la autoridad; los botones visibles no garantizan permisos si la sesión cambió.

### Orden para pruebas

1. Haz copia de seguridad de `safelab_db` en pgAdmin. Detén Web/Mobile/Backend.
2. Inicia **Backend RC3** en IntelliJ (`postgres`, las cinco variables privadas ya configuradas). Verifica Swagger y Flyway V4.
3. Inicia **Web RC3** (`npm install`, `npm run dev`, opcional `npm run build`).
4. Ejecuta **Mobile RC3** en Android Emulator (servidor local `http://10.0.2.2:8080/api/v1`).
5. Ingresa como gerente en ambas aplicaciones. Crea un activo en Web; cambia de módulo en Mobile y vuelve a Activos: debe aparecer **sin cerrar sesión**.
6. Edita ubicación/estado desde Mobile; cambia de módulo en Web y vuelve: verifica el mismo registro.
7. Comprueba actualización desde pgAdmin, intenta eliminar un activo sin dependencias y uno con sensores vinculados (este último debe devolver 409), y valida una cuenta de técnico sin permisos de edición.
8. Corre las consultas de diagnóstico y la matriz QA antes de cualquier commit o tag.

---

# SafeLab Web — v2.5.0 (API local)

## Corrección de asignaciones de activos — v2.5.0 RC2 (2026-11-07)

**Motivo:** en la entrega RC1 `responsible` era texto libre y `users.resourceIds` era el
control de acceso. Por eso poner "Andrea Torres" en un activo no lo hacía visible
para esa cuenta. Los KPI estaban bien calculados según los activos autorizados,
pero la asignación era inconsistente.

**Cambios:** `responsibleUserId` es el vínculo por ID al empleado existente. El gerente
elige de una lista de empleados activos de **su empresa** y **sede autorizada**;
Spring Boot valida esas restricciones y guarda tanto el activo como su asignación
(`users.resourceIds`). El responsable anterior pierde el acceso derivado de ese
vínculo cuando se transfiere; los recursos adicionales concedidos explícitamente
a través de *Users & Permissions* siguen siendo una autorización independiente.
Los KPI se recalculan sobre la lista actualizada tras volver a sincronizar.

- **PostgreSQL:** Flyway `V4__asset_responsible_user_assignment.sql` añade una
  referencia SQL verificada por empresa, enlaza registros legados cuyo nombre
  coincida con un único empleado activo autorizado para la sede y añade esos
  activos a `resource_ids` sin borrar otras asignaciones. No borra datos, no
  repite el seed y no altera V1–V3.
- **Web:** el campo *Responsible* deja de ser un texto libre y pasa a ser un
  selector de empleados existentes; el formulario envía el ID. Al crear también
  persiste `status` y `lastInspection` (antes se perdían en POST).
- **Android:** en el formulario de alta desde *Facilities* el gerente puede
  elegir un empleado existente; el perfil del empleado y su colección de activos
  se refrescan desde la API cuando la aplicación retoma actividad.
- **JSON Server:** la semilla de demostración conserva el mismo criterio de IDs;
  la actualización de una base JSON de ejecución requiere reset explícito.

**Importante:** no crear aún el tag v2.5.0 ni publicar RC2 como versión final.
Esta es una candidata a pruebas; Maven, Vite, Gradle, PostgreSQL y emulador
requieren comprobación completa en el equipo local.

### Orden obligatorio de prueba

1. Detener los tres procesos. Hacer una **copia de seguridad de `safelab_db`**.
2. Sustituir primero el backend por RC2 (mantener variables privadas actuales).
3. Iniciarlo con perfil `postgres`: Flyway aplica automáticamente **V4 una sola vez**.
   Comprobar en `flyway_schema_history` que la V4 finalizó correctamente.
4. Ejecutar Web RC2 con `npm install` y `npm run dev` (no se necesita su `npm run server`).
5. Entrar como gerente, editar `Freezer QA Web v2.5`, seleccionar **Andrea Torres**
   en el nuevo desplegable y guardar. Cerrar e iniciar la sesión de Andrea,
   o refrescarla, para que vuelva a consultar el alcance.
6. Comprobar el inventario y los KPI de Andrea, los IDs de usuario de los activos
   y el cambio en PostgreSQL. El total **debería ser 7 solo si** permanecen los
   6 activos del seed asignados a Andrea y el Freezer QA de prueba se vincula a ella;
   cualquier filtro de sede o permisos adicional cambia el resultado.
7. Abrir Mobile RC2 en emulador, iniciar sesión como Andrea y revisar su listado.

Consultas SQL de verificación (pgAdmin → `safelab_db`):

```sql
SELECT installed_rank, version, description, success
FROM public.flyway_schema_history ORDER BY installed_rank;

SELECT a.id, a.name, a.responsible, a.responsible_user_id,
       u.full_name AS employee_name, a.facility_id
FROM public.assets a
LEFT JOIN public.users u ON a.responsible_user_id = u.id
WHERE a.organization_id = 'org-andes'
ORDER BY a.name;

SELECT u.full_name, u.resource_ids
FROM public.users u WHERE u.full_name = 'Andrea Torres';

SELECT count(*) AS linked_assets
FROM public.assets a JOIN public.users u
 ON a.responsible_user_id = u.id
WHERE u.full_name = 'Andrea Torres' AND a.organization_id = 'org-andes';
```

**Diferencia entre roles:** la lista del gerente muestra todos los activos de su
organización, mientras la de Andrea solo muestra aquellos autorizados por su
alcance y sedes. `responsible` es una etiqueta legada; el identificador seguro
es `responsibleUserId`. Los ajustes manuales en Users & Permissions conceden
acceso, pero no cambian por sí mismos quién figura como responsable principal.

---


## Integración local v2.5.0 (desarrollo)

Esta versión **no despliega servicios**. Las tres aplicaciones siguen separadas, pero Web y Mobile consumen HTTP/JSON desde **SafeLab Platform API**. La API es la única que conoce las credenciales PostgreSQL, realiza las validaciones y aplica IAM/RBAC/RLS. Ninguna contraseña SQL se incorpora a Vue o Android.

### Arquitectura

```text
Vue (localhost:5173)  ──────┐
                            ├── Spring Boot API (localhost:8080) ── PostgreSQL (5432)
Android emulator (10.0.2.2) ┘
```

**JSON Server se conserva en el repositorio backend** como perfil `jsonserver` opcional. Los frontends siempre consumen la API Spring Boot, nunca `data/db.json` ni PostgreSQL directamente.

### Qué está conectado

- Login real y Bearer token, con datos de sesión obtenidos de Spring Boot.
- `GET /api/v1/integration/bootstrap`: snapshot multiempresa filtrado en servidor, sin contraseñas. Las pantallas de los 12 BC pueden leer las colecciones autorizadas.
- Altas y modificaciones principales de activos y sensores, incidentes, órdenes de mantenimiento y reportes, usando endpoints específicos, no un CRUD global abierto.
- Acciones de alertas, comandos simulados, invitaciones, permisos y asignaciones de empleados donde el frontend dispone de la operación correspondiente.
- Refresco de datos Web al recuperar el foco y Mobile al reanudar la actividad. **No hay WebSocket ni actualización instantánea en segundo plano**.

### Limitaciones explícitas

No todos los flujos heredados del frontend tienen equivalentes seguros en el backend v2. Los controles de configuración global de plataforma, simulaciones puramente visuales, carga de evidencias/archivos y algunas operaciones de gestión especial aún requieren endpoints y pruebas adicionales. No deben considerarse persistidos solo porque una pantalla cambie de apariencia. El modo Android de depuración permite HTTP a la máquina del desarrollador; en producción se requerirá HTTPS y una URL real.

La integración se considera **candidata a validación**, no aprobada ni lista para producción, hasta ejecutar `mvn test`, `npm run build`, el build Android y la matriz de pruebas cruzadas indicada en `docs/INTEGRATION_TEST_PLAN.md`.

---

## Historial y guía de la versión anterior

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
