import { defineStore } from 'pinia'
import { initialMultiTenantData as initialSafeLabData } from '@/shared/domain/data/safelab-multitenant-seed'
import { apiClient } from '@/shared/infrastructure/http/api-client'
import { ROLE_GRANTABLE } from '@/boundedcontext/identityaccess/domain/models/permission-catalog'

const STORAGE_KEY = 'safelab-web-multitenant-v1'
const USE_REMOTE_API = false // Only local mock state. No deployment or remote backend.

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
  const rows = Array.isArray(state.data[key]) ? state.data[key] : []
  if (!user || user.role === 'platformAdmin' || user.role === 'safeLabAdministrator') return rows
  const organizationId = user.organizationId
  const tenantRows = rows.filter(row => row.organizationId === organizationId)
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
    setSessionScope(user) { this.sessionUser = user ? {id:user.id,role:user.role,organizationId:user.organizationId,facilityId:user.facilityId,facilityIds:user.facilityIds || [],resourceIds:user.resourceIds || []} : null; this.selectedFacilityId='all' },
    organizationUsers(organizationId) { return this.data.users.filter(u=>u.organizationId===organizationId) },
    subscriptionFor(organizationId) { return this.data.subscriptions.find(s=>s.organizationId===organizationId) },
    reservedSeats(organizationId) {return this.data.invitations.filter(i=>i.organizationId===organizationId && i.status==='pending' && new Date(i.expiresAt)>new Date()).length},
    occupiedSeats(organizationId) {return this.organizationUsers(organizationId).filter(u=>u.role!=='organizationAdmin' && ['active','pending_email_verification'].includes(u.status)).length},
    availableSeats(organizationId) {const s=this.subscriptionFor(organizationId);return s?Math.max(0,s.includedSeats+s.additionalSeats-this.occupiedSeats(organizationId)-this.reservedSeats(organizationId)):0},
    saveResourceAssignments(userId, facilityIds, resourceIds, actor) {
      const target=this.data.users.find(u=>u.id===userId)
      const org=this.data.organizations.find(o=>o.id===actor?.organizationId)
      if(!target||!org||actor.role!=='organizationAdmin'||target.organizationId!==org.id||target.role==='organizationAdmin')return false
      target.facilityIds=facilityIds.filter(id=>org.facilityIds.includes(id))
      const resources=new Set(this.data.assets.filter(a=>a.organizationId===org.id).map(a=>a.id))
      target.resourceIds=resourceIds.filter(id=>resources.has(id))
      this.persist()
      this.addAudit({actor:actor.fullName,action:`Updated assignments for ${target.fullName}`,module:'Identity & Access',organizationId:org.id})
      if(this.sessionUser?.id===userId)this.setSessionScope(target)
      return true
    },
    savePermissionOverrides(userId, values, actor) {
      const target=this.data.users.find(u=>u.id===userId)
      if (!target || !actor || actor.role!=='organizationAdmin' || actor.organizationId!==target.organizationId || target.role==='organizationAdmin') return false
      // Prevent privilege escalation even when the UI is bypassed.
      if(Object.entries(values).some(([name,enabled])=>enabled && !(ROLE_GRANTABLE[target.role]||[]).includes(name)))return false
      this.data.permissionOverrides[userId]={...values}
      this.addAudit({actor:actor.fullName,action:`Updated permissions for ${target.fullName}`,module:'Identity & Access',severity:'info',organizationId:target.organizationId})
      this.persist()
      return true
    },
    createInvitation({email,role,facilityIds,resourceIds},actor){
      if(actor?.role!=='organizationAdmin'||!this.availableSeats(actor.organizationId)) return {error:'noSeats'}
      if(!email || !role || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {error:'invalid'}
      if(this.data.users.some(u=>u.email.toLowerCase()===email.toLowerCase())) return {error:'duplicate'}
      if(this.data.invitations.some(i=>i.organizationId===actor.organizationId&&i.email===email.toLowerCase()&&i.status==='pending'&&new Date(i.expiresAt)>new Date())) return {error:'duplicate'}
      const org=this.data.organizations.find(o=>o.id===actor.organizationId)
      if(!org || !((org.segment==='pharmaceutical'?['pharmaOperationsCoordinator','pharmaTechnician','complianceOfficer','maintenanceOperator']:['bioclinicalCoordinator','labTechnician','complianceOfficer','maintenanceOperator']).includes(role))) return {error:'invalidRole'}
      const token=Array.from(crypto.getRandomValues(new Uint8Array(12)),v=>v.toString(16).padStart(2,'0')).join('').toUpperCase()
      const invitation={id:crypto.randomUUID(),token,organizationId:org.id,email:email.toLowerCase(),role,facilityIds:(facilityIds||[]).filter(id=>org.facilityIds.includes(id)),resourceIds:resourceIds||[],status:'pending',createdBy:actor.id,createdAt:nowIso(),expiresAt:new Date(Date.now()+72*3600000).toISOString()}
      this.data.invitations.push(invitation);this.persist();return {invitation}
    },
    cancelInvitation(id,actor){const inv=this.data.invitations.find(i=>i.id===id && i.organizationId===actor?.organizationId);if(!inv||actor.role!=='organizationAdmin'||inv.status!=='pending')return false;inv.status='cancelled';this.persist();return true},
    persist() {
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeDataShape(this.data)))
    },

    async syncFromBackend() {
      // Reads the optional local JSON server: npm run server. Never contacts a deployed backend.
      // After loading, interactions remain client-side simulated.
      try {
        const { data } = await apiClient.get('/db', { timeout: 2500 })
        if (!Array.isArray(data?.sensors) || !Array.isArray(data?.assets)) return false
        this.data = normalizeDataShape(data)
        this.backendConnected = false
        this.lastSyncedAt = nowIso()
        this.persist()
        return true
      } catch {
        // The bundled seed still allows the interface to work without npm run server.
        return false
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
      const synced = !localStorage.getItem(STORAGE_KEY) && await this.syncFromBackend()
      if (synced || this.operationalStateInitialized) return
      this.operationalStateInitialized = true
      this.persist()
    },

    async addAudit({ actor = 'System', action, module = 'System', severity = 'info', status = 'reviewed', evidence = null, organizationId = this.sessionUser?.organizationId }) {
      const payload = { id: nextId('aud'), actor, action, module, severity, status, evidence: evidence || nextId('EVD'), createdAt: nowIso(), organizationId }
      this.data.auditLogs.unshift(payload)
      this.persist()
      if (USE_REMOTE_API && this.backendConnected) {
        try { await apiClient.post('/auditLogs', payload); await this.syncFromBackend() } catch {}
      }
      return payload
    },

    async addNotification({ title, message, context = 'system', severity = 'info' }) {
      const payload = { id: nextId('not'), title, message, context, severity, unread: true, organizationId:this.sessionUser?.organizationId, createdAt: nowIso() }
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
        try { await apiClient.post(`/alertsincidents/notifications/${id}/mark-read`); await this.syncFromBackend() } catch {}
      }
    },

    async markAllNotificationsRead() {
      this.data.notifications.forEach((item) => { item.unread = false })
      this.persist()
      if (USE_REMOTE_API) {
        await Promise.allSettled(this.data.notifications.map((item) => apiClient.post(`/alertsincidents/notifications/${item.id}/mark-read`)))
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
        try { await apiClient.post(`/alertsincidents/alerts/${id}/acknowledge`, { actor: alert.assignedTo }); await this.syncFromBackend() } catch {}
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
        try { await apiClient.post(`/alertsincidents/alerts/${id}/resolve`, { actor: alert.assignedTo }); await this.syncFromBackend() } catch {}
      }
    },

    async escalateAlert(id) {
      const alert = patchLocalItem(this.data.alerts, id, { status: 'escalated' })
      const incident = alert ? this.createIncidentFromAlertLocal(alert) : null
      this.persist()
      if (USE_REMOTE_API && alert) {
        try { await apiClient.post(`/alertsincidents/alerts/${id}/escalate`, { actor: alert.assignedTo }); await this.syncFromBackend() } catch {}
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
        try { await apiClient.post('/alertsincidents/incidents', incident); await this.syncFromBackend() } catch {}
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
            await apiClient.patch(`/sensormonitoring/sensors/${id}/reading`, { value: sensor.value })
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
        try { await apiClient.post('/sensormonitoring/sensors', sensor); await this.syncFromBackend() } catch (error) { this.backendError = error.message }
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
          if (asset.id) await apiClient.patch(`/facilityassets/assets/${asset.id}`, asset)
          else await apiClient.post('/facilityassets/assets', created)
          await this.syncFromBackend()
        } catch (error) { this.backendError = error.message }
      }
    },

    async deleteAsset(id) {
      const { filtered } = removeLocalItem(this.data.assets, id)
      this.data.assets = filtered
      this.persist()
      if (USE_REMOTE_API) {
        try { await apiClient.delete(`/facilityassets/assets/${id}`); await this.syncFromBackend() } catch (error) { this.backendError = error.message }
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
        await this.addNotification({ title: 'Command blocked', message: `${actuator.name} rejected ${command}.`, context: 'remoteactuation', severity: 'warning' })
        return
      }
      this.commandInProgress = actuatorId
      actuator.lastCommand = `${command} in progress`
      actuator.running = command === 'Start' ? true : command === 'Stop' ? false : actuator.running
      this.persist()
      if (USE_REMOTE_API) {
        try {
          await apiClient.post(`/remoteactuation/actuators/${actuatorId}/commands`, { command, requestedBy: actor })
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
          if (normalized === 'investigating') await apiClient.post(`/alertsincidents/incidents/${id}/start-investigation`)
          else if (normalized === 'resolved') await apiClient.post(`/alertsincidents/incidents/${id}/mark-resolved`)
          else if (normalized === 'closed') await apiClient.post(`/alertsincidents/incidents/${id}/close`)
          else await apiClient.patch(`/incidents/${id}`, { status: normalized, updatedAt: incident.updatedAt })
          await this.syncFromBackend()
        } catch (error) { this.backendError = error.message }
      }
    },

    async generateReport(type = 'Operational', title = null) {
      const report = { id: nextId('rep'), title: title || `${type} report ${new Date().toLocaleDateString()}`, type, format: 'CSV', status: 'ready', organizationId:this.sessionUser?.organizationId, generatedAt: nowIso() }
      this.data.reports.unshift(report)
      this.persist()
      if (USE_REMOTE_API) {
        try {
          const { data } = await apiClient.post('/reportinganalytics/reports/generate', { type, title: report.title, format: report.format })
          await this.syncFromBackend()
          return data
        } catch (error) { this.backendError = error.message }
      }
      return report
    }
  }
})
