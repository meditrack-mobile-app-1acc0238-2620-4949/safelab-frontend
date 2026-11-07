// IAM permission contract shared by every organization. No role can cross tenant boundaries.
export const PERMISSION_GROUPS = [
  { id: 'users', permissions: ['users.view', 'users.invite', 'users.permissions.manage'] },
  { id: 'assets', permissions: ['assets.view', 'assets.manage'] },
  { id: 'sensors', permissions: ['sensors.view', 'sensors.configure'] },
  { id: 'maintenance', permissions: ['maintenance.view', 'maintenance.manage'] },
  { id: 'incidents', permissions: ['incidents.view', 'incidents.create', 'alerts.acknowledge', 'incidents.resolve'] },
  { id: 'compliance', permissions: ['compliance.view', 'compliance.manage'] },
  { id: 'actuation', permissions: ['actuation.view', 'actuation.execute'] },
  { id: 'dashboard', permissions: ['dashboard.view'] },
  { id: 'reports', permissions: ['reports.view', 'reports.export'] },
  { id: 'audit', permissions: ['audit.view'] }
]
export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap(group => group.permissions)
export const ROLE_NAMES = ['bioclinicalCoordinator','labTechnician','pharmaOperationsCoordinator','pharmaTechnician','complianceOfficer','maintenanceOperator']
export const SEGMENT_ROLES = {
  laboratory: ['bioclinicalCoordinator','labTechnician','complianceOfficer','maintenanceOperator'],
  pharmaceutical: ['pharmaOperationsCoordinator','pharmaTechnician','complianceOfficer','maintenanceOperator']
}
const P = {
  base: ['dashboard.view','assets.view','sensors.view','incidents.view','incidents.create'],
  coordinator: ['maintenance.view','alerts.acknowledge','incidents.resolve','compliance.view','reports.view'],
  compliance: ['compliance.view','compliance.manage','alerts.acknowledge','incidents.resolve','reports.view','reports.export','audit.view'],
  technician: ['maintenance.view'],
  maintenance: ['maintenance.view','maintenance.manage','actuation.view']
}
const union = (...arrays) => [...new Set(arrays.flat())]
export const ROLE_DEFAULTS = {
  bioclinicalCoordinator: union(P.base,P.coordinator),
  labTechnician: union(P.base),
  pharmaOperationsCoordinator: union(P.base,P.coordinator,['assets.manage']),
  pharmaTechnician: union(P.base),
  complianceOfficer: union(P.base,P.compliance,P.technician),
  maintenanceOperator: union(P.base,P.maintenance)
}
export const ROLE_GRANTABLE = {
  bioclinicalCoordinator: union(ROLE_DEFAULTS.bioclinicalCoordinator,['assets.manage','sensors.configure','maintenance.manage','compliance.manage','reports.export','audit.view','actuation.view']),
  labTechnician: union(ROLE_DEFAULTS.labTechnician,['maintenance.view','alerts.acknowledge','compliance.view','reports.view']),
  pharmaOperationsCoordinator: union(ROLE_DEFAULTS.pharmaOperationsCoordinator,['sensors.configure','maintenance.manage','compliance.manage','reports.export','audit.view','actuation.view']),
  pharmaTechnician: union(ROLE_DEFAULTS.pharmaTechnician,['maintenance.view','alerts.acknowledge','compliance.view','reports.view']),
  complianceOfficer: union(ROLE_DEFAULTS.complianceOfficer,['actuation.view']),
  maintenanceOperator: union(ROLE_DEFAULTS.maintenanceOperator,['sensors.configure','alerts.acknowledge','incidents.resolve','compliance.view','reports.view','audit.view','actuation.execute'])
}
// These permissions cannot be delegated to employees by switches.
export const MANAGER_PERMISSIONS = ALL_PERMISSIONS.filter(p => p !== 'actuation.execute' && p !== 'sensors.configure')
export const CONTEXT_PERMISSION = {
  dashboardinsights: 'dashboard.view', facilityassets: 'assets.view', equipmentmaintenance: 'maintenance.view',
  sensormonitoring: 'sensors.view', environmentalcompliance: 'compliance.view', alertsincidents: 'incidents.view',
  remoteactuation: 'actuation.view', reportinganalytics: 'reports.view', audittraceability: 'audit.view',
  identityaccess: 'users.view', subscriptionbilling: 'billing.read', userprofiles: 'profile.read'
}
export function effectivePermissions(user, overrides = {}) {
  if (!user) return []
  if (user.role === 'platformAdmin' || user.role === 'safeLabAdministrator') return [...ALL_PERMISSIONS, 'billing.read']
  if (user.role === 'organizationAdmin') return [...MANAGER_PERMISSIONS, 'billing.read']
  const allowed = new Set(ROLE_GRANTABLE[user.role] || [])
  return ALL_PERMISSIONS.filter(p => allowed.has(p) && (overrides[p] === undefined ? (ROLE_DEFAULTS[user.role] || []).includes(p) : overrides[p] === true))
}
export function canUsePermission(user, permission, overrides = {}) {
  return effectivePermissions(user, overrides).includes(permission)
}
