import { defineStore } from 'pinia'
import { initialSafeLabData } from '@/shared/domain/data/safelab-demo-seed'
import { apiClient } from '@/shared/infrastructure/http/api-client'

const STORAGE_KEY = 'safelab-integrated-api-cache-v1'
const USE_REMOTE_API = import.meta.env.VITE_USE_REMOTE_API !== 'false'

const clone = (value) => JSON.parse(JSON.stringify(value))
const nowIso = () => new Date().toISOString()
const nextId = (prefix) => `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`

const listKeys = [
  'users', 'facilities', 'sensors', 'assets', 'alerts', 'notifications', 'incidents',
  'actuators', 'remoteCommands', 'reports', 'auditLogs', 'complianceRules'
]

function normalizeDataShape(value) {
  const base = clone(initialSafeLabData)
  const candidate = value && typeof value === 'object' ? value : {}

  listKeys.forEach((key) => {
    base[key] = Array.isArray(candidate[key]) ? candidate[key] : base[key]
  })

  base.billing = candidate.billing && typeof candidate.billing === 'object'
    ? { ...base.billing, ...candidate.billing }
    : base.billing

  return base
}

function getInitialState() {
  if (typeof localStorage === 'undefined') return normalizeDataShape()

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try { return normalizeDataShape(JSON.parse(saved)) }
    catch { localStorage.removeItem(STORAGE_KEY) }
  }

  return normalizeDataShape()
}

function normalizeStatus(value) {
  return String(value || '').toLowerCase().replaceAll(' ', '-')
}

function isNormalSensor(sensor) {
  return normalizeStatus(sensor?.status) === 'normal'
}

function patchLocalItem(items, id, patch) {
  const item = items.find((candidate) => candidate.id === id)
  if (item) Object.assign(item, patch)
  return item
}

function removeLocalItem(items, id) {
  const item = items.find((candidate) => candidate.id === id)
  const filtered = items.filter((candidate) => candidate.id !== id)
  return { item, filtered }
}

export const useSafeLabDemoStore = defineStore('safelab-demo', {
  state: () => ({
    data: getInitialState(),
    selectedFacilityId: 'all',
    selectedPeriod: '24h',
    liveSimulation: false,
    commandInProgress: null,
    operationalStateInitialized: false,
    backendConnected: false,
    backendLoading: false,
    backendError: null,
    lastSyncedAt: null
  }),

  getters: {
    users: (state) => Array.isArray(state.data.users) ? state.data.users : [],
    facilities: (state) => Array.isArray(state.data.facilities) ? state.data.facilities : [],
    sensors: (state) => Array.isArray(state.data.sensors) ? state.data.sensors : [],
    assets: (state) => Array.isArray(state.data.assets) ? state.data.assets : [],
    alerts: (state) => Array.isArray(state.data.alerts) ? state.data.alerts : [],
    notifications: (state) => Array.isArray(state.data.notifications) ? state.data.notifications : [],
    incidents: (state) => Array.isArray(state.data.incidents) ? state.data.incidents : [],
    actuators: (state) => Array.isArray(state.data.actuators) ? state.data.actuators : [],
    remoteCommands: (state) => Array.isArray(state.data.remoteCommands) ? state.data.remoteCommands : [],
    reports: (state) => Array.isArray(state.data.reports) ? state.data.reports : [],
    auditLogs: (state) => Array.isArray(state.data.auditLogs) ? state.data.auditLogs : [],
    billing: (state) => state.data.billing || {},
    complianceRules: (state) => Array.isArray(state.data.complianceRules) ? state.data.complianceRules : [],
    unreadNotifications: (state) => (Array.isArray(state.data.notifications) ? state.data.notifications : []).filter((n) => n.unread),
    unreadCount: (state) => (Array.isArray(state.data.notifications) ? state.data.notifications : []).filter((n) => n.unread).length,

    scopedFacilities: (state) => (user) => {
      if (!user || user.role === 'safeLabAdministrator' || user.facilityId === 'global') return state.data.facilities
      return state.data.facilities.filter((facility) => facility.id === user.facilityId)
    },

    scopedItems: (state) => (collection, user, facilityId = state.selectedFacilityId) => {
      const items = Array.isArray(state.data[collection]) ? state.data[collection] : []
      const userFacilityId = user?.facilityId
      return items.filter((item) => {
        const itemFacility = item.facilityId || item.facilityID
        const matchesRole = !user || user.role === 'safeLabAdministrator' || userFacilityId === 'global' || !itemFacility || itemFacility === userFacilityId
        const matchesFilter = !facilityId || facilityId === 'all' || !itemFacility || itemFacility === facilityId
        return matchesRole && matchesFilter
      })
    },

    dashboardSummary: (state) => (user) => {
      const isGlobal = !user || user.role === 'safeLabAdministrator' || user.facilityId === 'global'
      const facilities = isGlobal ? state.data.facilities : state.data.facilities.filter((f) => f.id === user.facilityId)
      const facilityIds = new Set(facilities.map((f) => f.id))
      const sensors = state.data.sensors.filter((s) => facilityIds.has(s.facilityId))
      const assets = state.data.assets.filter((a) => facilityIds.has(a.facilityId))
      const alerts = state.data.alerts.filter((a) => facilityIds.has(a.facilityId))
      const incidents = state.data.incidents.filter((i) => facilityIds.has(i.facilityId))
      const reports = state.data.reports
      const onlineSensors = sensors.filter((s) => s.connection === 'online').length
      const abnormalSensors = sensors.filter((s) => !isNormalSensor(s)).length
      const activeAlerts = alerts.filter((a) => ['active', 'acknowledged'].includes(a.status)).length
      const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length
      const openIncidents = incidents.filter((i) => i.status !== 'closed' && i.status !== 'resolved').length
      const compliantAssets = assets.filter((a) => a.status === 'compliant').length
      const complianceScore = assets.length ? Math.round((compliantAssets / assets.length) * 100) : 100
      const telemetryScore = sensors.length ? Math.round((onlineSensors / sensors.length) * 100) : 100
      const healthScore = Math.max(0, Math.round((complianceScore * 0.35) + (telemetryScore * 0.35) + (Math.max(0, 100 - activeAlerts * 8 - openIncidents * 10 - abnormalSensors * 5) * 0.30)))
      return {
        healthScore,
        complianceScore,
        telemetryScore,
        activeSensors: onlineSensors,
        totalSensors: sensors.length,
        storageUnits: assets.length,
        activeAlerts,
        criticalAlerts,
        openIncidents,
        reportsReady: reports.filter((r) => r.status === 'ready').length,
        facilities: facilities.length,
        disconnectedSensors: sensors.filter((s) => s.connection !== 'online').length,
        abnormalSensors,
        pendingEvidence: incidents.reduce((sum, incident) => sum + (incident.evidence ? 0 : 1), 0)
      }
    }
  },

  actions: {
    persist() {
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeDataShape(this.data)))
    },

    async syncFromBackend() {
      if (!USE_REMOTE_API) return false

      this.backendLoading = true
      try {
        const { data } = await apiClient.get('/demo/state')
        this.data = normalizeDataShape(data)
        this.backendConnected = true
        this.backendError = null
        this.lastSyncedAt = nowIso()
        this.persist()
        return true
      } catch (error) {
        this.backendConnected = false
        this.backendError = error.message
        return false
      } finally {
        this.backendLoading = false
      }
    },

    async refreshState() {
      return this.syncFromBackend()
    },

    async resetDemo() {
      if (USE_REMOTE_API) {
        try {
          const { data } = await apiClient.post('/demo/reset')
          this.data = normalizeDataShape(data)
          this.backendConnected = true
          this.backendError = null
          this.lastSyncedAt = nowIso()
          this.operationalStateInitialized = false
          this.persist()
          return
        } catch (error) {
          this.backendConnected = false
          this.backendError = error.message
        }
      }
      this.data = normalizeDataShape()
      this.operationalStateInitialized = false
      this.persist()
    },

    setFacility(facilityId) { this.selectedFacilityId = facilityId },
    setPeriod(period) { this.selectedPeriod = period },

    async initializeOperationalState() {
      this.data = normalizeDataShape(this.data)
      const synced = await this.syncFromBackend()
      if (synced || this.operationalStateInitialized) return
      this.operationalStateInitialized = true
      this.persist()
    },

    async addAudit({ actor = 'System', action, module = 'System', severity = 'info', status = 'reviewed', evidence = null }) {
      const payload = { id: nextId('aud'), actor, action, module, severity, status, evidence: evidence || nextId('EVD'), createdAt: nowIso() }
      this.data.auditLogs.unshift(payload)
      this.persist()
      if (USE_REMOTE_API && this.backendConnected) {
        try { await apiClient.post('/auditLogs', payload); await this.syncFromBackend() } catch {}
      }
      return payload
    },

    async addNotification({ title, message, context = 'system', severity = 'info' }) {
      const payload = { id: nextId('not'), title, message, context, severity, unread: true, createdAt: nowIso() }
      this.data.notifications.unshift(payload)
      this.persist()
      if (USE_REMOTE_API && this.backendConnected) {
        try { await apiClient.post('/notifications', payload); await this.syncFromBackend() } catch {}
      }
      return payload
    },

    async markNotificationRead(id) {
      const notification = patchLocalItem(this.data.notifications, id, { unread: false })
      this.persist()
      if (USE_REMOTE_API && notification) {
        try { await apiClient.post(`/alerts-notifications/notifications/${id}/mark-read`); await this.syncFromBackend() } catch {}
      }
    },

    async markAllNotificationsRead() {
      this.data.notifications.forEach((item) => { item.unread = false })
      this.persist()
      if (USE_REMOTE_API) {
        await Promise.allSettled(this.data.notifications.map((item) => apiClient.post(`/alerts-notifications/notifications/${item.id}/mark-read`)))
        await this.syncFromBackend()
      }
    },

    async createAlert(payload) {
      const sensor = this.data.sensors.find((item) => item.id === payload.sensorId)
      const alert = {
        id: nextId('alert'),
        type: payload.type || sensor?.type || 'System',
        title: payload.title,
        message: payload.message,
        sensorId: payload.sensorId,
        assetId: payload.assetId || sensor?.assetId,
        facilityId: payload.facilityId || sensor?.facilityId || 'fac-central',
        severity: payload.severity || 'warning',
        status: 'active',
        createdAt: nowIso(),
        assignedTo: payload.assignedTo || sensor?.responsible || 'Operations team'
      }
      this.data.alerts.unshift(alert)
      this.persist()
      if (USE_REMOTE_API) {
        try { await apiClient.post('/alerts', alert); await this.syncFromBackend() } catch {}
      }
      return alert
    },

    async acknowledgeAlert(id) {
      const alert = patchLocalItem(this.data.alerts, id, { status: 'acknowledged', acknowledgedAt: nowIso() })
      this.persist()
      if (USE_REMOTE_API && alert) {
        try { await apiClient.post(`/alerts-notifications/alerts/${id}/acknowledge`, { actor: alert.assignedTo }); await this.syncFromBackend() } catch {}
      }
    },

    async resolveAlert(id) {
      const alert = patchLocalItem(this.data.alerts, id, { status: 'resolved', resolvedAt: nowIso() })
      if (alert) {
        const sensor = this.data.sensors.find((item) => item.id === alert.sensorId)
        if (sensor) sensor.status = 'normal'
      }
      this.persist()
      if (USE_REMOTE_API && alert) {
        try { await apiClient.post(`/alerts-notifications/alerts/${id}/resolve`, { actor: alert.assignedTo }); await this.syncFromBackend() } catch {}
      }
    },

    async escalateAlert(id) {
      const alert = patchLocalItem(this.data.alerts, id, { status: 'escalated' })
      const incident = alert ? this.createIncidentFromAlertLocal(alert) : null
      this.persist()
      if (USE_REMOTE_API && alert) {
        try { await apiClient.post(`/alerts-notifications/alerts/${id}/escalate`, { actor: alert.assignedTo }); await this.syncFromBackend() } catch {}
      }
      return incident
    },

    createIncidentFromAlertLocal(alert) {
      const exists = this.data.incidents.find((item) => item.relatedAlertId === alert.id)
      if (exists) return exists
      const code = `INC-${String(this.data.incidents.length + 1).padStart(3, '0')}`
      const incident = {
        id: nextId('inc'), code, title: alert.title, description: alert.message, facilityId: alert.facilityId,
        relatedAlertId: alert.id, relatedSensorId: alert.sensorId, relatedAssetId: alert.assetId,
        severity: alert.severity, status: 'open', assignedTo: alert.assignedTo,
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), evidence: 0, createdAt: nowIso(), updatedAt: nowIso()
      }
      this.data.incidents.unshift(incident)
      return incident
    },

    async createIncidentFromAlert(alert) {
      const incident = this.createIncidentFromAlertLocal(alert)
      this.persist()
      if (USE_REMOTE_API) {
        try { await apiClient.post('/incident-management/incidents', incident); await this.syncFromBackend() } catch {}
      }
      return incident
    },

    async simulateSensorBreach(sensorId, severity = 'critical') {
      const sensor = this.data.sensors.find((item) => item.id === sensorId) || this.data.sensors.find((item) => isNormalSensor(item))
      if (!sensor) return
      const value = sensor.type === 'temperature'
        ? Number(sensor.max || 8) + (severity === 'critical' ? 2.4 : 0.8)
        : sensor.type === 'humidity'
          ? Number(sensor.max || 60) + (severity === 'critical' ? 8 : 3)
          : sensor.type === 'vibration'
            ? Number(sensor.max || 3) + 1.2
            : sensor.value
      return this.updateSensor(sensor.id, { value, status: severity === 'critical' ? 'out-of-range' : 'warning' })
    },

    async updateSensor(id, patch) {
      const sensor = this.data.sensors.find((item) => item.id === id)
      if (!sensor) return
      Object.assign(sensor, patch, { lastReading: nowIso() })
      const numeric = Number(sensor.value)
      if (['temperature', 'humidity', 'vibration', 'energy'].includes(sensor.type)) {
        sensor.status = numeric < Number(sensor.min) || numeric > Number(sensor.max) ? 'out-of-range' : 'normal'
      }
      this.persist()
      if (USE_REMOTE_API) {
        try {
          if (Object.prototype.hasOwnProperty.call(patch, 'value')) {
            await apiClient.patch(`/sensor-monitoring/sensors/${id}/reading`, { value: sensor.value })
          } else {
            await apiClient.patch(`/sensors/${id}`, patch)
          }
          await this.syncFromBackend()
        } catch (error) {
          this.backendError = error.message
        }
      }
    },

    async addSensor(payload) {
      const sensor = { id: nextId('sen'), code: `SEN-${Math.floor(Math.random() * 900 + 100)}`, status: 'normal', connection: 'online', lastReading: nowIso(), ...payload }
      this.data.sensors.unshift(sensor)
      this.persist()
      if (USE_REMOTE_API) {
        try { await apiClient.post('/sensor-monitoring/sensors', sensor); await this.syncFromBackend() } catch (error) { this.backendError = error.message }
      }
      return sensor
    },

    async deleteSensor(id) {
      const { filtered } = removeLocalItem(this.data.sensors, id)
      this.data.sensors = filtered
      this.persist()
      if (USE_REMOTE_API) {
        try { await apiClient.delete(`/sensors/${id}`); await this.syncFromBackend() } catch (error) { this.backendError = error.message }
      }
    },

    async saveAsset(asset) {
      let created = asset
      if (asset.id) {
        const index = this.data.assets.findIndex((item) => item.id === asset.id)
        if (index >= 0) this.data.assets[index] = { ...this.data.assets[index], ...asset }
      } else {
        created = { ...asset, id: nextId('asset'), lastInspection: asset.lastInspection || new Date().toISOString().slice(0, 10), status: asset.status || 'compliant' }
        this.data.assets.unshift(created)
      }
      this.persist()
      if (USE_REMOTE_API) {
        try {
          if (asset.id) await apiClient.patch(`/asset-inventory/assets/${asset.id}`, asset)
          else await apiClient.post('/asset-inventory/assets', created)
          await this.syncFromBackend()
        } catch (error) { this.backendError = error.message }
      }
    },

    async deleteAsset(id) {
      const { filtered } = removeLocalItem(this.data.assets, id)
      this.data.assets = filtered
      this.persist()
      if (USE_REMOTE_API) {
        try { await apiClient.delete(`/asset-inventory/assets/${id}`); await this.syncFromBackend() } catch (error) { this.backendError = error.message }
      }
    },

    async toggleRule(id) {
      const rule = this.data.complianceRules.find((item) => item.id === id)
      if (!rule) return
      rule.status = rule.status === 'active' ? 'paused' : 'active'
      this.persist()
      if (USE_REMOTE_API) {
        try { await apiClient.patch(`/complianceRules/${id}`, { status: rule.status }); await this.syncFromBackend() } catch (error) { this.backendError = error.message }
      }
    },

    async attachEvidence(incidentId) {
      const incident = this.data.incidents.find((item) => item.id === incidentId)
      if (!incident) return
      incident.evidence = (incident.evidence || 0) + 1
      incident.updatedAt = nowIso()
      this.persist()
      if (USE_REMOTE_API) {
        try { await apiClient.patch(`/incidents/${incidentId}`, { evidence: incident.evidence, updatedAt: incident.updatedAt }); await this.syncFromBackend() } catch (error) { this.backendError = error.message }
      }
    },

    async executeCommand(actuatorId, command, actor = 'Current user') {
      const actuator = this.data.actuators.find((item) => item.id === actuatorId)
      if (!actuator) return
      if (actuator.status !== 'online' || actuator.safetyState === 'blocked') {
        await this.addNotification({ title: 'Command blocked', message: `${actuator.name} rejected ${command}.`, context: 'remote-control', severity: 'warning' })
        return
      }
      this.commandInProgress = actuatorId
      actuator.lastCommand = `${command} in progress`
      actuator.running = command === 'Start' ? true : command === 'Stop' ? false : actuator.running
      this.persist()
      if (USE_REMOTE_API) {
        try {
          await apiClient.post(`/remote-control/actuators/${actuatorId}/commands`, { command, requestedBy: actor })
          await this.syncFromBackend()
        } catch (error) {
          this.backendError = error.message
        } finally {
          this.commandInProgress = null
        }
        return
      }
      const record = { id: nextId('cmd'), command, device: actuator.name, actuatorId, status: 'completed', requestedBy: actor, createdAt: nowIso() }
      this.data.remoteCommands.unshift(record)
      actuator.lastCommand = command
      this.commandInProgress = null
      this.persist()
      return record
    },

    async updateIncidentStatus(id, status) {
      const normalized = normalizeStatus(status)
      const incident = this.data.incidents.find((item) => item.id === id)
      if (!incident) return
      incident.status = normalized
      incident.updatedAt = nowIso()
      if (incident.status === 'closed' || incident.status === 'resolved') {
        const alert = this.data.alerts.find((item) => item.id === incident.relatedAlertId)
        if (alert) alert.status = 'resolved'
      }
      this.persist()
      if (USE_REMOTE_API) {
        try {
          if (normalized === 'investigating') await apiClient.post(`/incident-management/incidents/${id}/start-investigation`)
          else if (normalized === 'resolved') await apiClient.post(`/incident-management/incidents/${id}/mark-resolved`)
          else if (normalized === 'closed') await apiClient.post(`/incident-management/incidents/${id}/close`)
          else await apiClient.patch(`/incidents/${id}`, { status: normalized, updatedAt: incident.updatedAt })
          await this.syncFromBackend()
        } catch (error) { this.backendError = error.message }
      }
    },

    async generateReport(type = 'Operational', title = null) {
      const report = { id: nextId('rep'), title: title || `${type} report ${new Date().toLocaleDateString()}`, type, format: type === 'Compliance' ? 'PDF' : 'CSV', status: 'ready', generatedAt: nowIso() }
      this.data.reports.unshift(report)
      this.persist()
      if (USE_REMOTE_API) {
        try {
          const { data } = await apiClient.post('/reports-analytics/reports/generate', { type, title: report.title, format: report.format })
          await this.syncFromBackend()
          return data
        } catch (error) { this.backendError = error.message }
      }
      return report
    }
  }
})
