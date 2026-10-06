import DashboardOverviewView from '@/dashboard-overview/presentation/views/DashboardOverviewView.vue'

const dashboardRoute = (path, name, title, mode, viewKey) => ({
  path,
  name,
  component: DashboardOverviewView,
  props: { mode },
  meta: { title, contextKey: 'dashboard', viewKey }
})

export const routes = [
  dashboardRoute('dashboard-overview', 'dashboard-overview', 'Dashboard & Overview', 'laboratory-dashboard', 'dashboard.LaboratoryDashboard'),
  dashboardRoute('dashboard-overview/laboratory-dashboard', 'dashboard-overview-laboratory-dashboard', 'Laboratory Dashboard', 'laboratory-dashboard', 'dashboard.LaboratoryDashboard'),
  dashboardRoute('dashboard-overview/compliance-overview', 'dashboard-overview-compliance-overview', 'Compliance Overview', 'compliance-overview', 'dashboard.ComplianceOverview'),
  dashboardRoute('dashboard-overview/platform-overview', 'dashboard-overview-platform-overview', 'Platform Overview', 'platform-overview', 'dashboard.PlatformOverview'),
  dashboardRoute('dashboard-overview/kpi-summary', 'dashboard-overview-kpi-summary', 'KPI Summary', 'kpi-summary', 'dashboard.KPISummary'),
  dashboardRoute('dashboard-overview/alert-overview', 'dashboard-overview-alert-overview', 'Alert Overview', 'alert-overview', 'dashboard.AlertOverview'),
  dashboardRoute('dashboard-overview/asset-overview', 'dashboard-overview-asset-overview', 'Asset Overview', 'asset-overview', 'dashboard.AssetOverview'),
  dashboardRoute('dashboard-overview/sensor-overview', 'dashboard-overview-sensor-overview', 'Sensor Overview', 'sensor-overview', 'dashboard.SensorOverview'),
  dashboardRoute('dashboard-overview/incident-overview', 'dashboard-overview-incident-overview', 'Incident Overview', 'incident-overview', 'dashboard.IncidentOverview'),
  dashboardRoute('dashboard-overview/dashboard-filters', 'dashboard-overview-dashboard-filters', 'Dashboard Filters', 'dashboard-filters', 'dashboard.DashboardFilters'),
  dashboardRoute('dashboard-overview/dashboard-widgets', 'dashboard-overview-dashboard-widgets', 'Dashboard Widgets', 'dashboard-widgets', 'dashboard.DashboardWidgets')
]
