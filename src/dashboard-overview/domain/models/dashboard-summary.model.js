export class DashboardSummary {
  constructor({
    fallback = false,
    lastUpdated = '',
    healthScore = 0,
    kpis = [],
    widgets = [],
    notifications = [],
    trends = [],
    compliance = {},
    filters = [],
    laboratories = [],
    operationalRisks = []
  } = {}) {
    this.fallback = fallback
    this.lastUpdated = lastUpdated
    this.healthScore = healthScore
    this.kpis = kpis
    this.widgets = widgets
    this.notifications = notifications
    this.trends = trends
    this.compliance = compliance
    this.filters = filters
    this.laboratories = laboratories
    this.operationalRisks = operationalRisks
  }

  get criticalAlerts() {
    return this.kpis.find(kpi => kpi.key === 'criticalAlerts')?.value ?? 0
  }

  get complianceScore() {
    return this.kpis.find(kpi => kpi.key === 'complianceScore')?.value ?? this.healthScore ?? 0
  }
}
