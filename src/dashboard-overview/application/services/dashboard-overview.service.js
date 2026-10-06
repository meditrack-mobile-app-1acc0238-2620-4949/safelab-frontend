import { dashboardOverviewApiService } from '@/dashboard-overview/infrastructure/http/dashboard-overview-api.service'
import { DashboardSummary } from '@/dashboard-overview/domain/models/dashboard-summary.model'
import { DashboardWidget } from '@/dashboard-overview/domain/entities/dashboard-widget.entity'
import { filterRecordsForCurrentUser, currentScopeLabel } from '@/shared/application/services/role-data-filter.service'
import { useAuthStore } from '@/identity-access/application/stores/auth.store'

const average = (values = []) => {
  const numericValues = values.map(Number).filter((value) => Number.isFinite(value))
  if (!numericValues.length) return 0
  return Math.round((numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length) * 10) / 10
}

const normalizeStatus = (value) => String(value || '').toLowerCase()
const isActiveAlert = (alert) => !['resolved', 'closed'].includes(normalizeStatus(alert.status))
const isCritical = (record) => ['critical', 'high'].includes(normalizeStatus(record.severity || record.priority || record.status))
const isSensorNormal = (sensor) => normalizeStatus(sensor.status) === 'normal'
const isSensorOutOfRange = (sensor) => ['outofrange', 'out-of-range', 'warning', 'critical'].includes(normalizeStatus(sensor.status))
const isSensorDisconnected = (sensor) => ['offline', 'disconnected', 'inactive'].includes(normalizeStatus(sensor.sensorStatus))
const isAssetCompliant = (asset) => normalizeStatus(asset.status) === 'compliant'
const isReportReady = (report) => ['generated', 'ready'].includes(normalizeStatus(report.status))

const lastTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const statusFromScore = (score) => {
  if (score >= 85) return 'success'
  if (score >= 65) return 'warning'
  return 'danger'
}

export const fallbackOverview = {
  fallback: true,
  lastUpdated: '2026-06-19T05:30:00',
  healthScore: 0,
  kpis: [],
  compliance: {
    score: 0,
    compliantStorage: 0,
    totalStorage: 0,
    violatedRules: 0,
    evidenceReady: 0,
    nextAuditKey: 'dashboardOverview.values.nextAudit'
  },
  widgets: [],
  notifications: [],
  trends: [],
  filters: [],
  laboratories: [],
  operationalRisks: []
}

export class DashboardOverviewService {
  async fetchOverview() {
    const data = await dashboardOverviewApiService.getOverview()
    return this.toSummary(this.buildOverviewFromOperationalData(data))
  }

  buildOverviewFromOperationalData(data) {
    const authStore = useAuthStore()
    authStore.restoreSession()

    const user = authStore.currentUser
    const sensors = filterRecordsForCurrentUser(data.sensors || [])
    const assets = filterRecordsForCurrentUser(data.assets || [])
    const alerts = filterRecordsForCurrentUser(data.alerts || [])
    const incidents = filterRecordsForCurrentUser(data.incidents || [])
    const reports = filterRecordsForCurrentUser(data.reports || [])
    const historicalData = filterRecordsForCurrentUser(data.historicalData || [])

    const activeAlerts = alerts.filter(isActiveAlert)
    const criticalAlerts = activeAlerts.filter(isCritical)
    const openIncidents = incidents.filter((incident) => !['resolved', 'closed'].includes(normalizeStatus(incident.status)))
    const criticalIncidents = openIncidents.filter(isCritical)
    const normalSensors = sensors.filter(isSensorNormal)
    const outOfRangeSensors = sensors.filter(isSensorOutOfRange)
    const disconnectedSensors = sensors.filter(isSensorDisconnected)
    const compliantAssets = assets.filter(isAssetCompliant)
    const reportsReady = reports.filter(isReportReady)

    const sensorCompliance = sensors.length ? Math.round((normalSensors.length / sensors.length) * 100) : 0
    const assetCompliance = assets.length ? Math.round((compliantAssets.length / assets.length) * 100) : sensorCompliance
    const complianceScore = Math.round(((sensorCompliance || 0) + (assetCompliance || 0)) / (sensors.length && assets.length ? 2 : 1))
    const healthScore = Math.max(0, Math.min(100, Math.round(complianceScore - criticalAlerts.length * 3 - criticalIncidents.length * 2 + reportsReady.length)))

    const avgTemperature = average(historicalData.map((record) => record.temperature)) || average(sensors.filter((sensor) => sensor.type === 'Temperature').map((sensor) => sensor.value))
    const avgHumidity = average(historicalData.map((record) => record.humidity)) || average(sensors.filter((sensor) => sensor.type === 'Humidity').map((sensor) => sensor.value))

    const groupedFacilities = new Map()
    ;[...sensors, ...assets, ...alerts].forEach((record) => {
      const id = record.facilityId || record.facilityName || 'facility'
      if (!groupedFacilities.has(id)) {
        groupedFacilities.set(id, {
          id,
          name: record.facilityName || record.location || 'Operational scope',
          sensors: 0,
          alerts: 0,
          compliantAssets: 0,
          totalAssets: 0
        })
      }

      const facility = groupedFacilities.get(id)
      if (record.code?.startsWith?.('SEN') || record.sensorStatus) facility.sensors += 1
      if (record.severity && record.status) facility.alerts += isActiveAlert(record) ? 1 : 0
      if (record.storageUnit || record.category) {
        facility.totalAssets += 1
        if (isAssetCompliant(record)) facility.compliantAssets += 1
      }
    })

    const laboratories = [...groupedFacilities.values()].map((facility) => {
      const score = facility.totalAssets
        ? Math.round((facility.compliantAssets / facility.totalAssets) * 100)
        : complianceScore

      return {
        id: facility.id,
        name: facility.name,
        sensors: facility.sensors,
        alerts: facility.alerts,
        score,
        status: statusFromScore(score)
      }
    }).slice(0, 5)

    const firstAlerts = activeAlerts
      .slice()
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 4)
      .map((alert) => ({
        id: alert.id,
        severity: normalizeStatus(alert.severity) === 'critical' ? 'danger' : normalizeStatus(alert.severity) === 'warning' ? 'warning' : 'success',
        titleKey: alert.title || alert.deviceName || 'Operational alert',
        messageKey: alert.description || alert.location || 'Review required.',
        time: lastTime(alert.createdAt),
        source: alert.deviceName
      }))

    const scopeLabel = currentScopeLabel()
    const roleLabel = authStore.roleLabel || user?.role || 'Guest'

    return {
      fallback: false,
      lastUpdated: new Date().toISOString(),
      healthScore,
      kpis: [
        { key: 'activeSensors', labelKey: 'dashboardOverview.kpis.activeSensors', value: sensors.length, unit: '', trendKey: 'dashboardOverview.trendsText.online', status: sensors.length ? 'success' : 'warning', icon: 'pi pi-wifi' },
        { key: 'storageUnits', labelKey: 'dashboardOverview.kpis.storageUnits', value: assets.length, unit: '', trendKey: 'dashboardOverview.trendsText.monitored', status: assets.length ? 'success' : 'warning', icon: 'pi pi-box' },
        { key: 'complianceScore', labelKey: 'dashboardOverview.kpis.complianceScore', value: complianceScore, unit: '%', trendKey: 'dashboardOverview.trendsText.improved', status: statusFromScore(complianceScore), icon: 'pi pi-check-circle' },
        { key: 'openAlerts', labelKey: 'dashboardOverview.kpis.openAlerts', value: activeAlerts.length, unit: '', trendKey: 'dashboardOverview.trendsText.requiresAttention', status: activeAlerts.length ? 'warning' : 'success', icon: 'pi pi-bell' },
        { key: 'criticalIncidents', labelKey: 'dashboardOverview.kpis.criticalIncidents', value: criticalIncidents.length, unit: '', trendKey: 'dashboardOverview.trendsText.urgent', status: criticalIncidents.length ? 'danger' : 'success', icon: 'pi pi-exclamation-triangle' },
        { key: 'reportsReady', labelKey: 'dashboardOverview.kpis.reportsReady', value: reportsReady.length, unit: '', trendKey: 'dashboardOverview.trendsText.exportable', status: 'neutral', icon: 'pi pi-file-export' }
      ],
      compliance: {
        score: complianceScore,
        compliantStorage: compliantAssets.length,
        totalStorage: assets.length,
        violatedRules: outOfRangeSensors.length + criticalAlerts.length,
        evidenceReady: reportsReady.length,
        nextAuditKey: 'dashboardOverview.values.nextAudit'
      },
      widgets: [
        { id: 'laboratory', titleKey: 'dashboardOverview.widgets.laboratory', type: 'summary', value: `${healthScore}%`, status: statusFromScore(healthScore), descriptionKey: 'dashboardOverview.widgets.laboratoryCopy', route: '/dashboard-overview/laboratory-dashboard' },
        { id: 'compliance', titleKey: 'dashboardOverview.widgets.compliance', type: 'summary', value: outOfRangeSensors.length, status: outOfRangeSensors.length ? 'warning' : 'success', descriptionKey: 'dashboardOverview.widgets.complianceCopy', route: '/dashboard-overview/compliance-overview' },
        { id: 'platform', titleKey: 'dashboardOverview.widgets.platform', type: 'summary', value: user?.role === 'safeLabAdministrator' ? (data.users || []).length : 1, status: 'success', descriptionKey: 'dashboardOverview.widgets.platformCopy', route: '/dashboard-overview/platform-overview' },
        { id: 'kpis', titleKey: 'dashboardOverview.widgets.kpis', type: 'summary', value: 6, status: 'neutral', descriptionKey: 'dashboardOverview.widgets.kpisCopy', route: '/dashboard-overview/kpi-summary' },
        { id: 'alerts', titleKey: 'dashboardOverview.widgets.alerts', type: 'summary', value: activeAlerts.length, status: activeAlerts.length ? 'warning' : 'success', descriptionKey: 'dashboardOverview.widgets.alertsCopy', route: '/dashboard-overview/alert-overview' },
        { id: 'assets', titleKey: 'dashboardOverview.widgets.assets', type: 'summary', value: assets.length, status: 'success', descriptionKey: 'dashboardOverview.widgets.assetsCopy', route: '/dashboard-overview/asset-overview' },
        { id: 'sensors', titleKey: 'dashboardOverview.widgets.sensors', type: 'summary', value: sensors.length, status: 'success', descriptionKey: 'dashboardOverview.widgets.sensorsCopy', route: '/dashboard-overview/sensor-overview' },
        { id: 'incidents', titleKey: 'dashboardOverview.widgets.incidents', type: 'summary', value: openIncidents.length, status: openIncidents.length ? 'danger' : 'success', descriptionKey: 'dashboardOverview.widgets.incidentsCopy', route: '/dashboard-overview/incident-overview' }
      ],
      notifications: firstAlerts,
      trends: [
        { labelKey: 'dashboardOverview.trends.temperature', values: [avgTemperature, avgTemperature + 0.2, avgTemperature - 0.1, avgTemperature + 0.1].map((value) => Math.max(0, Math.round(value * 10) / 10)), unit: '°C' },
        { labelKey: 'dashboardOverview.trends.humidity', values: [avgHumidity, avgHumidity + 2, avgHumidity - 1, avgHumidity].map((value) => Math.max(0, Math.round(value))), unit: '%' },
        { labelKey: 'dashboardOverview.trends.alerts', values: [activeAlerts.length + 2, activeAlerts.length + 1, activeAlerts.length, Math.max(0, activeAlerts.length - 1)], unit: '' },
        { labelKey: 'dashboardOverview.trends.compliance', values: [Math.max(0, complianceScore - 8), Math.max(0, complianceScore - 4), complianceScore, healthScore], unit: '%' }
      ],
      filters: [
        { key: 'role', labelKey: 'dashboardOverview.filters.role', value: roleLabel },
        { key: 'laboratory', labelKey: 'dashboardOverview.filters.laboratory', value: scopeLabel },
        { key: 'period', labelKey: 'dashboardOverview.filters.period', valueKey: 'dashboardOverview.values.last24Hours' },
        { key: 'refreshRate', labelKey: 'dashboardOverview.filters.refreshRate', valueKey: 'dashboardOverview.values.refreshRate' }
      ],
      laboratories: laboratories.length ? laboratories : [{ id: 'scope', name: scopeLabel, sensors: sensors.length, alerts: activeAlerts.length, score: complianceScore, status: statusFromScore(complianceScore) }],
      operationalRisks: [
        { id: 1, labelKey: 'dashboardOverview.risks.temperatureDeviation', value: outOfRangeSensors.length, status: outOfRangeSensors.length ? 'danger' : 'success' },
        { id: 2, labelKey: 'dashboardOverview.risks.disconnectedSensors', value: disconnectedSensors.length, status: disconnectedSensors.length ? 'warning' : 'success' },
        { id: 3, labelKey: 'dashboardOverview.risks.pendingEvidence', value: reports.filter((report) => normalizeStatus(report.status) === 'pending').length, status: 'warning' },
        { id: 4, labelKey: 'dashboardOverview.risks.openIncidents', value: openIncidents.length, status: openIncidents.length ? 'warning' : 'success' }
      ]
    }
  }

  toSummary(data) {
    return new DashboardSummary({
      ...data,
      widgets: (data.widgets || []).map(widget => new DashboardWidget(widget))
    })
  }
}

export const dashboardOverviewService = new DashboardOverviewService()
