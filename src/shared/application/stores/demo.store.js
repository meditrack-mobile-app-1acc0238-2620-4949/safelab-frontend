import { defineStore } from 'pinia'
import { initialMultiTenantData as initialSafeLabData } from '@/shared/domain/data/safelab-multitenant-seed'
import { apiClient } from '@/shared/infrastructure/http/api-client'
import { ROLE_GRANTABLE } from '@/boundedcontext/identityaccess/domain/models/permission-catalog'

const STORAGE_KEY = 'safelab-web-multitenant-v1'
const USE_REMOTE_API = true // v2.5: Spring Boot es la autoridad para los datos.

const clone = (value) => JSON.parse(JSON.stringify(value))
const nowIso = () => new Date().toISOString()
const nextId = (prefix) => `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`

const listKeys = [
  'users', 'facilities', 'sensors', 'assets', 'alerts', 'notifications', 'incidents',
  'actuators', 'remoteCommands', 'reports', 'auditLogs', 'complianceRules', 'complianceEvaluations', 'complianceViolations', 'maintenanceRecords',
  'organizations', 'subscriptions', 'invitations', 'accountRequests'
]

function normalizeDataShape(value) {
  const base = clone(initialSafeLabData)
  const candidate = value && typeof value === 'object' ? value : {}

  listKeys.forEach((key) => {
    base[key] = Array.isArray(candidate[key]) ? candidate[key] : base[key]
  })

  // An older browser cache may still contain the previous platform-admin email.
  // Update only this fixed demonstration identity, not corporate user accounts.
  for (const user of base.users) {
    if (user.role === 'platformAdmin' && user.email === 'admin@hotmail.com') {
      user.email = 'admin@safelab.test'
    }
  }

  base.permissionOverrides = candidate.permissionOverrides && typeof candidate.permissionOverrides === 'object' ? candidate.permissionOverrides : {}

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

// A single, understandable scope function is used by summaries, lists and exports.
// Frontend filtering improves UX; the future backend MUST enforce these rules too.
function visibleRows(state, key, user) {
  // Los permisos pueden actualizarse desde otra sesion; el bootstrap contiene el usuario vigente.
  if (user?.id && user.id === state.sessionUser?.id) user = state.sessionUser
  const rows = Array.isArray(state.data[key]) ? state.data[key] : []
  if (!user || user.role === 'platformAdmin' || user.role === 'safeLabAdministrator') return rows
  const organizationId = user.organizationId
  const tenantRows = rows.filter(row => row.organizationId === organizationId)
  // The API bootstrap already filters by tenant, facility and assigned resources.
  if (state.backendConnected) return tenantRows
  if (user.role === 'organizationAdmin') return tenantRows
  const facilities = new Set(user.facilityIds || (user.facilityId ? [user.facilityId] : []))
  const resourceIds = new Set(user.resourceIds || [])
  const targeted = ['assets','sensors','alerts','incidents','actuators','maintenanceRecords','remoteCommands','complianceRules','complianceEvaluations','complianceViolations']
  return tenantRows.filter(row => {
    if (row.facilityId && facilities.size && !facilities.has(row.facilityId)) return false
    if (!targeted.includes(key) || !resourceIds.size) return true
    if (key==='assets') return resourceIds.has(row.id)
    if (key==='sensors') return resourceIds.has(row.id) || resourceIds.has(row.assetId)
    if (row.assetId || row.sensorId || row.relatedAssetId || row.relatedSensorId) return [row.assetId,row.sensorId,row.relatedAssetId,row.relatedSensorId].some(id=>resourceIds.has(id))
    if (row.equipmentId) return resourceIds.has(row.equipmentId)
    if (row.actuatorId) {
      const actuator=state.data.actuators.find(a=>a.id===row.actuatorId)
      return actuator ? (!actuator.assetId || resourceIds.has(actuator.assetId)) : false
    }
    if (row.ruleId) {
      const rule=state.data.complianceRules.find(a=>a.id===row.ruleId)
      return rule ? resourceIds.has(rule.sensorId) : false
    }
    if (row.evaluationId) {
      const evaluation=state.data.complianceEvaluations.find(a=>a.id===row.evaluationId)
      return evaluation ? resourceIds.has(evaluation.sensorId) : false
    }
    return true
  })
}
export const useSafeLabDemoStore = defineStore('safelab-demo', {
  state: () => ({
    data: getInitialState(),
    sessionUser: null,
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
    organizations: (state) => state.data.organizations || [],
    subscriptions: (state) => state.data.subscriptions || [],
    invitations: (state) => state.data.invitations || [],
    accountRequests: (state) => state.data.accountRequests || [],
    users: (state) => visibleRows(state, 'users', state.sessionUser),
    facilities: (state) => visibleRows(state, 'facilities', state.sessionUser),
    sensors: (state) => visibleRows(state, 'sensors', state.sessionUser),
    assets: (state) => visibleRows(state, 'assets', state.sessionUser),
    alerts: (state) => visibleRows(state, 'alerts', state.sessionUser),
    notifications: (state) => visibleRows(state, 'notifications', state.sessionUser),
    incidents: (state) => visibleRows(state, 'incidents', state.sessionUser),
    actuators: (state) => visibleRows(state, 'actuators', state.sessionUser),
    remoteCommands: (state) => visibleRows(state, 'remoteCommands', state.sessionUser),
    reports: (state) => visibleRows(state, 'reports', state.sessionUser),
    auditLogs: (state) => visibleRows(state, 'auditLogs', state.sessionUser),
    maintenanceRecords: (state) => visibleRows(state, 'maintenanceRecords', state.sessionUser),
    billing: (state) => state.data.subscriptions?.find(s=>s.organizationId===state.sessionUser?.organizationId) || {},
    complianceRules: (state) => visibleRows(state, 'complianceRules', state.sessionUser),
    complianceEvaluations: (state) => visibleRows(state, 'complianceEvaluations', state.sessionUser),
    complianceViolations: (state) => visibleRows(state, 'complianceViolations', state.sessionUser),
    unreadNotifications: (state) => visibleRows(state,'notifications',state.sessionUser).filter(n => n.unread),
    unreadCount: (state) => visibleRows(state,'notifications',state.sessionUser).filter(n => n.unread).length,

    scopedFacilities: (state) => user => visibleRows(state,'facilities',user),

    scopedItems: (state) => (collection,user,facilityId=state.selectedFacilityId) => visibleRows(state,collection,user)
      .filter(item=>facilityId==='all' || !facilityId || !item.facilityId || item.facilityId===facilityId),

    dashboardSummary: (state) => (user) => {
      const facilities = visibleRows(state, 'facilities', user)
      const sensors = visibleRows(state, 'sensors', user)
      const assets = visibleRows(state, 'assets', user)
      const alerts = visibleRows(state, 'alerts', user)
      const incidents = visibleRows(state, 'incidents', user)
      const reports = visibleRows(state, 'reports', user)
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
        disconnectedSensors: sensors.filter((s) => s.connection === 'offline').length,
        maintenanceSensors: sensors.filter((s) => s.connection === 'maintenance').length,
        abnormalSensors,
        pendingEvidence: incidents.reduce((sum, incident) => sum + (incident.evidence ? 0 : 1), 0)
      }
    }
  },

  actions: {
    setSessionScope(user) { this.sessionUser = user ? {...user,facilityIds:user.facilityIds || [],resourceIds:user.resourceIds || []} : null; if (!user) this.selectedFacilityId='all' },
    organizationUsers(organizationId) { return this.data.users.filter(u=>u.organizationId===organizationId) },
    subscriptionFor(organizationId) { return this.data.subscriptions.find(s=>s.organizationId===organizationId) },
    reservedSeats(organizationId) {return this.data.invitations.filter(i=>i.organizationId===organizationId && i.status==='pending' && new Date(i.expiresAt)>new Date()).length},
    occupiedSeats(organizationId) {return this.organizationUsers(organizationId).filter(u=>u.role!=='organizationAdmin' && ['active','pending_email_verification'].includes(u.status)).length},
    availableSeats(organizationId) {const s=this.subscriptionFor(organizationId);return s?Math.max(0,s.includedSeats+s.additionalSeats-this.occupiedSeats(organizationId)-this.reservedSeats(organizationId)):0},
    async saveResourceAssignments(userId, facilityIds, resourceIds, actor) {
      if (actor?.role !== 'organizationAdmin') return false
      await apiClient.patch(`/identityaccess/organizations/${actor.organizationId}/users/${encodeURIComponent(userId)}/assignments`,
        { facilityIds, resourceIds })
      await this.syncFromBackend()
      return true
    },
    async savePermissionOverrides(userId, values, actor) {
      if (actor?.role !== 'organizationAdmin') return false
      const allowed = ROLE_GRANTABLE[this.data.users.find(u => u.id === userId)?.role] || []
      const permissions = Object.entries(values).filter(([key, active]) => active && allowed.includes(key)).map(([key]) => key)
      await apiClient.put(`/identityaccess/organizations/${actor.organizationId}/users/${encodeURIComponent(userId)}/permissions`, { permissions })
      await this.syncFromBackend()
      return true
    },
    async createInvitation({email,role,facilityIds,resourceIds}, actor) {
      if (actor?.role !== 'organizationAdmin') return {error:'invalid'}
      try {
        const { data } = await apiClient.post(`/identityaccess/organizations/${actor.organizationId}/invitations`,
          { email,role,facilityIds,resourceIds })
        await this.syncFromBackend()
        return { invitation: data }
      } catch (error) { this.backendError = error.message; return {error:error.code || 'invalid'} }
    },
    async cancelInvitation(id, actor) {
      try {
        await apiClient.post(`/identityaccess/organizations/${actor.organizationId}/invitations/${encodeURIComponent(id)}/cancel`)
        await this.syncFromBackend()
        return true
      } catch (error) { this.backendError = error.message; return false }
    },
    persist() {
      if (USE_REMOTE_API) return // No guardar copias como fuente de verdad en el navegador.
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeDataShape(this.data)))
    },

    async syncFromBackend() {
      if (!sessionStorage.getItem('safelab-api-token-v25')) return false
      this.backendLoading = true
      try {
        const { data } = await apiClient.get('/integration/bootstrap')
        if (!Array.isArray(data?.sensors) || !Array.isArray(data?.assets)) throw new Error('Respuesta de API inválida')
        this.data = normalizeDataShape(data)
        if (data.currentUser?.id) {
          this.setSessionScope(data.currentUser)
          // Keep the visible UI permission checks in sync with the current API session.
          const auth = (await import('@/boundedcontext/identityaccess/application/stores/auth.store')).useAuthStore()
          if (auth.currentUser?.id === data.currentUser.id) auth.setRemoteUser(data.currentUser)
        }
        this.data.invitations.forEach(inv => { inv.token ||= inv.code || '' })
        this.backendConnected = true
        this.backendError = null
        this.lastSyncedAt = nowIso()
        return true
      } catch (error) {
        this.backendConnected = false
        this.backendError = error.message
        return false
      } finally { this.backendLoading = false }
    },

    async refreshState() {
      return this.syncFromBackend()
    },

    async resetDemo() {
      throw new Error('No se permite restaurar PostgreSQL desde el frontend. Utiliza los procedimientos de datos demo del backend.')
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

    async addAudit({ actor = 'System', action, module = 'System', severity = 'info', status = 'reviewed', evidence = null, organizationId = this.sessionUser?.organizationId }) {
      const payload = { id: nextId('aud'), actor, action, module, severity, status, evidence: evidence || nextId('EVD'), createdAt: nowIso(), organizationId }
      this.data.auditLogs.unshift(payload)
      this.persist()

      return payload
    },

    async addNotification({ title, message, context = 'system', severity = 'info' }) {
      const payload = { id: nextId('not'), title, message, context, severity, unread: true, organizationId:this.sessionUser?.organizationId, createdAt: nowIso() }
      this.data.notifications.unshift(payload)
      this.persist()

      return payload
    },

    async markNotificationRead(id) {
      await apiClient.post(`/alertsincidents/notifications/${encodeURIComponent(id)}/mark-read`)
      await this.syncFromBackend()
    },

    async markAllNotificationsRead() {
      const ids = this.notifications.filter(item => item.unread).map(item => item.id)
      for (const id of ids) await apiClient.post(`/alertsincidents/notifications/${encodeURIComponent(id)}/mark-read`)
      await this.syncFromBackend()
    },

    async createAlert(payload) {
      // No existe POST /alerts en v2. La API genera alertas a partir de lecturas fuera de rango.
      this.backendError = 'La alerta se genera desde /sensormonitoring/sensors/{id}/reading.'
      throw new Error(this.backendError)
    },

    async acknowledgeAlert(id) {
      await apiClient.post(`/alertsincidents/alerts/${encodeURIComponent(id)}/acknowledge`,
        { notes: 'Acknowledged from SafeLab Web' })
      await this.syncFromBackend()
    },
    async resolveAlert(id) {
      await apiClient.post(`/alertsincidents/alerts/${encodeURIComponent(id)}/resolve`,
        { notes: 'Resolved from SafeLab Web' })
      await this.syncFromBackend()
    },
    async escalateAlert(id) {
      const { data } = await apiClient.post(`/alertsincidents/alerts/${encodeURIComponent(id)}/escalate`,
        { notes: 'Escalated from SafeLab Web' })
      await this.syncFromBackend()
      return data
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
      const { data } = await apiClient.post('/alertsincidents/incidents', {
        title: alert.title, description: alert.message || alert.title,
        facilityId: alert.facilityId, severity: alert.severity,
        relatedSensorId: alert.sensorId || null
      })
      await this.syncFromBackend()
      return data
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
      if (Object.prototype.hasOwnProperty.call(patch, 'value')) {
        await apiClient.patch(`/sensormonitoring/sensors/${encodeURIComponent(id)}/reading`, { value: Number(patch.value) })
      } else {
        await apiClient.patch(`/sensormonitoring/sensors/${encodeURIComponent(id)}`, patch)
      }
      await this.syncFromBackend()
    },

    async addSensor(payload) {
      const body = { name:payload.name, code:payload.code, type:payload.type, facilityId:payload.facilityId,
        assetId:payload.assetId, unit:payload.unit, min:Number(payload.min), max:Number(payload.max) }
      const { data } = await apiClient.post('/sensormonitoring/sensors', body)
      await this.syncFromBackend()
      return data
    },

    async deleteSensor(id) {
      await apiClient.delete(`/sensormonitoring/sensors/${encodeURIComponent(id)}`)
      await this.syncFromBackend()
    },

    async saveAsset(asset) {
      if (asset.id) {
        const { id, organizationId, createdAt, updatedAt, ...changes } = asset
        if (!Object.prototype.hasOwnProperty.call(changes, 'responsibleUserId')) delete changes.responsible
        await apiClient.patch(`/facilityassets/assets/${encodeURIComponent(id)}`, changes)
      } else {
        const body = { name:asset.name, category:asset.category, facilityId:asset.facilityId,
          storageUnit:asset.storageUnit || '', location:asset.location || '',
          responsible:asset.responsible || '', responsibleUserId:asset.responsibleUserId || null,
          lastInspection:asset.lastInspection || null, status:asset.status || 'compliant' }
        await apiClient.post('/facilityassets/assets', body)
      }
      await this.syncFromBackend()
    },

    async deleteAsset(id) {
      await apiClient.delete(`/facilityassets/assets/${encodeURIComponent(id)}`)
      await this.syncFromBackend()
    },

    async toggleRule(id) {
      const rule = this.data.complianceRules.find(item => item.id === id)
      if (!rule) return
      await apiClient.patch(`/environmentalcompliance/rules/${encodeURIComponent(id)}`,
        {status:rule.status === 'active' ? 'paused' : 'active'})
      await this.syncFromBackend()
    },

    async attachEvidence(incidentId) {
      throw new Error('La carga de evidencias requiere un endpoint de archivos; pendiente de implementar.')
    },

    async executeCommand(actuatorId, command, actor = 'Current user') {
      this.commandInProgress = actuatorId
      try {
        const value = ({ START:'Start', STOP:'Stop', RESET:'Reset' })[String(command).toUpperCase()] || command
        const {data} = await apiClient.post(`/remoteactuation/actuators/${encodeURIComponent(actuatorId)}/commands`,
          {command:value})
        await this.syncFromBackend()
        return data
      } finally { this.commandInProgress=null }
    },

    async updateIncidentStatus(id, status) {
      const normalized = normalizeStatus(status)
      const operations = { investigating:'investigate', resolved:'resolve', closed:'close' }
      if (!operations[normalized]) throw new Error('Estado no admitido para esta operación')
      await apiClient.post(`/alertsincidents/incidents/${encodeURIComponent(id)}/${operations[normalized]}`,
        { notes:`Changed to ${normalized} from SafeLab Web` })
      await this.syncFromBackend()
    },

    async generateReport(type = 'Operational', title = null) {
      const { data } = await apiClient.post('/reportinganalytics/reports',
        {type, title:title || `${type} report ${new Date().toLocaleDateString()}`})
      await this.syncFromBackend()
      return data
    }
  }
})
