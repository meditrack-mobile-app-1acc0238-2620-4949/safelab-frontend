import DashboardOverviewView from '@/boundedcontext/dashboardinsights/presentation/views/DashboardOverviewView.vue'

const dashboardRoute = (path, name, title, mode, viewKey) => ({
  path,
  name,
  component: DashboardOverviewView,
  props: { mode },
  meta: { title, contextKey: 'dashboard', viewKey }
})

export const routes = [
  dashboardRoute('dashboardinsights', 'dashboardinsights', 'Dashboard & Overview', 'laboratory-dashboard', 'dashboard.LaboratoryDashboard'),
  dashboardRoute('dashboardinsights/laboratory-dashboard', 'dashboard-overview-laboratory-dashboard', 'Laboratory Dashboard', 'laboratory-dashboard', 'dashboard.LaboratoryDashboard'),
  dashboardRoute('dashboardinsights/compliance-overview', 'dashboard-overview-compliance-overview', 'Compliance Overview', 'compliance-overview', 'dashboard.ComplianceOverview'),
  dashboardRoute('dashboardinsights/platform-overview', 'dashboard-overview-platform-overview', 'Platform Overview', 'platform-overview', 'dashboard.PlatformOverview'),
  dashboardRoute('dashboardinsights/kpi-summary', 'dashboard-overview-kpi-summary', 'KPI Summary', 'kpi-summary', 'dashboard.KPISummary'),
  dashboardRoute('dashboardinsights/alert-overview', 'dashboard-overview-alert-overview', 'Alert Overview', 'alert-overview', 'dashboard.AlertOverview'),
  dashboardRoute('dashboardinsights/asset-overview', 'dashboard-overview-asset-overview', 'Asset Overview', 'asset-overview', 'dashboard.AssetOverview'),
  dashboardRoute('dashboardinsights/sensor-overview', 'dashboard-overview-sensor-overview', 'Sensor Overview', 'sensor-overview', 'dashboard.SensorOverview'),
  dashboardRoute('dashboardinsights/incident-overview', 'dashboard-overview-incident-overview', 'Incident Overview', 'incident-overview', 'dashboard.IncidentOverview'),
  dashboardRoute('dashboardinsights/dashboard-filters', 'dashboard-overview-dashboard-filters', 'Dashboard Filters', 'dashboard-filters', 'dashboard.DashboardFilters'),
  dashboardRoute('dashboardinsights/dashboard-widgets', 'dashboard-overview-dashboard-widgets', 'Dashboard Widgets', 'dashboard-widgets', 'dashboard.DashboardWidgets')
]
