export const boundedContextNavigation = [
  { context: 'dashboardinsights', titleKey: 'sidebar.dashboard', shortLabel: 'Dashboard', icon: 'table', path: '/dashboardinsights/laboratory-dashboard', roleScope: 'All roles' },
  { context: 'facilityassets', titleKey: 'sidebar.facility', shortLabel: 'Assets & Inventory', icon: 'box', path: '/facilityassets/asset-list', roleScope: 'Laboratory / Pharma' },
  { context: 'equipmentmaintenance', titleKey: 'sidebar.equipment', shortLabel: 'Equipment Health & Maintenance', icon: 'cog', path: '/equipmentmaintenance/overview', roleScope: 'Laboratory / Pharma' },
  { context: 'sensormonitoring', titleKey: 'sidebar.sensors', shortLabel: 'Sensor Monitoring', icon: 'wifi', path: '/sensormonitoring/live-readings', roleScope: 'Laboratory / Pharma' },
  { context: 'environmentalcompliance', titleKey: 'sidebar.environment', shortLabel: 'Compliance', icon: 'check-circle', path: '/environmentalcompliance/compliance-status', roleScope: 'Compliance' },
  { context: 'alertsincidents', titleKey: 'sidebar.alerts', shortLabel: 'Alerts', icon: 'exclamation-circle', path: '/alertsincidents/active-alerts', roleScope: 'All roles' },
  { context: 'remoteactuation', titleKey: 'sidebar.remote', shortLabel: 'Remote Control', icon: 'sliders-h', path: '/remoteactuation/remoteactuation-panel', roleScope: 'Authorized operators' },
  { context: 'reportinganalytics', titleKey: 'sidebar.reports', shortLabel: 'Reports & Analytics', icon: 'chart-line', path: '/reportinganalytics/analytics-dashboard', roleScope: 'Supervisors / Admin' },
  { context: 'audittraceability', titleKey: 'sidebar.audit', shortLabel: 'Audit Trail', icon: 'history', path: '/audittraceability/audit-log', roleScope: 'Admin / Compliance' }
]

export const hiddenOperationalContexts = [
  { context: 'userprofiles', path: '/userprofiles/my-profile' },
  { context: 'identityaccess', path: '/identityaccess/login' },
  { context: 'identityaccess', path: '/identityaccess/register' },
  { context: 'subscriptionbilling', path: '/subscriptionbilling/plans' }
]
