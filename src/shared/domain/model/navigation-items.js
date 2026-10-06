export const boundedContextNavigation = [
  { context: 'dashboard-overview', titleKey: 'contextLabels.dashboard', shortLabel: 'Dashboard', icon: 'table', path: '/dashboard-overview/laboratory-dashboard', roleScope: 'All roles' },
  { context: 'asset-inventory', titleKey: 'contextLabels.assets', shortLabel: 'Assets & Inventory', icon: 'box', path: '/asset-inventory/asset-list', roleScope: 'Laboratory / Pharma' },
  { context: 'sensor-monitoring', titleKey: 'contextLabels.sensors', shortLabel: 'Sensor Monitoring', icon: 'wifi', path: '/sensor-monitoring/live-readings', roleScope: 'Laboratory / Pharma' },
  { context: 'environmental-compliance', titleKey: 'contextLabels.compliance', shortLabel: 'Compliance', icon: 'check-circle', path: '/environmental-compliance/compliance-status', roleScope: 'Compliance' },
  { context: 'alerts-notifications', titleKey: 'contextLabels.alerts', shortLabel: 'Alerts', icon: 'exclamation-circle', path: '/alerts-notifications/active-alerts', roleScope: 'All roles' },
  { context: 'remote-control', titleKey: 'contextLabels.remote', shortLabel: 'Remote Control', icon: 'sliders-h', path: '/remote-control/remote-control-panel', roleScope: 'Authorized operators' },
  { context: 'reports-analytics', titleKey: 'contextLabels.reports', shortLabel: 'Reports & Analytics', icon: 'chart-line', path: '/reports-analytics/analytics-dashboard', roleScope: 'Supervisors / Admin' },
  { context: 'incident-management', titleKey: 'contextLabels.incidents', shortLabel: 'Incidents', icon: 'exclamation-triangle', path: '/incident-management/incident-list', roleScope: 'All roles' },
  { context: 'audit-traceability', titleKey: 'contextLabels.audit', shortLabel: 'Audit Trail', icon: 'history', path: '/audit-traceability/audit-log', roleScope: 'Admin / Compliance' }
]

export const hiddenOperationalContexts = [
  { context: 'user-profiles', path: '/user-profiles/my-profile' },
  { context: 'identity-access', path: '/identity-access/login' },
  { context: 'identity-access', path: '/identity-access/register' },
  { context: 'subscription-billing', path: '/subscription-billing/plans' }
]
