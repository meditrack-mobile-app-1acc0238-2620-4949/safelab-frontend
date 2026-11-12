<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
import { downloadCsv } from '@/shared/application/services/csv-export'
import PlatformMetricCard from '../components/PlatformMetricCard.vue'
import PlatformStatusBadge from '../components/PlatformStatusBadge.vue'
import PlatformSettingsPanel from './PlatformSettingsPanel.vue'

const demo = useSafeLabDemoStore()
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const ui = key => t(`platformUi.${key}`)

const page = computed(() => route.params.section || 'overview')
const organization = computed(() => demo.organizations.find(item => item.id === route.params.organizationId))
const orgTab = ref(String(route.query.tab || 'overview'))
const sensorDraft = ref(null)
const saveMessage = ref('')

const allUsers = computed(() => demo.data.users)
const allSubscriptions = computed(() => demo.subscriptions)
const allAudits = computed(() => demo.data.auditLogs)
const allInvoices = computed(() => allSubscriptions.value.flatMap(s =>
  (s.invoices || []).map(invoice => ({ ...invoice, organizationId: s.organizationId }))
))
const currentSubscription = computed(() => demo.subscriptionFor(organization.value?.id))
const organizationUsers = computed(() => organization.value ? demo.organizationUsers(organization.value.id) : [])
const scopeRows = collection => demo.data[collection]?.filter(item => item.organizationId === organization.value?.id) || []
const currentInvoices = computed(() => currentSubscription.value?.invoices || [])
const title = computed(() => organization.value?.name || t(`multi.platform_${page.value}`))

const money = amount => new Intl.NumberFormat(locale.value === 'es' ? 'es-PE' : 'en-US', {
  style: 'currency', currency: 'PEN'
}).format(Number(amount) || 0)
const date = value => value ? new Date(value).toLocaleDateString(locale.value === 'es' ? 'es-PE' : 'en-US') : '—'
const dateTime = value => value ? new Date(value).toLocaleString(locale.value === 'es' ? 'es-PE' : 'en-US', {
  dateStyle: 'medium', timeStyle: 'short'
}) : '—'
const orgName = organizationId => demo.organizations.find(o => o.id === organizationId)?.name || 'SafeLab'
const managerName = org => allUsers.value.find(u => u.id === org.managerId)?.fullName || '—'
const seatsUsed = orgId => demo.organizationUsers(orgId).filter(u => u.role !== 'organizationAdmin' && u.status === 'active').length
const seatCapacity = orgId => {
  const sub = demo.subscriptionFor(orgId)
  return (sub?.includedSeats || 10) + (sub?.additionalSeats || 0)
}
const openOrg = id => router.push(`/platform/organizations/${id}`)
const goto = section => router.push(`/platform/${section}`)
const openRecords = (collection, organizationId = '', returnTab = 'overview') => router.push({
  path: `/platform/records/${collection}`,
  query: organizationId ? { organizationId, returnTab } : {}
})
// Preserve the full-list return path when opening a company from its records table.
const backFromOrganization = () => route.query.from === 'records'
  ? openRecords('organizations')
  : goto('organizations')
// Summary cards navigate on their backgrounds and titles, but never hijack
// buttons inside the card (for example, a company link or Edit sensor).
function openSummary(event, collection, organizationId = '', returnTab = 'overview') {
  if (event.target.closest('button, a, input, select, textarea')) return
  openRecords(collection, organizationId, returnTab)
}
const preview = (rows, limit = 4) => rows.slice(0, limit)
const activeAlerts = rows => rows.filter(a => ['active', 'acknowledged'].includes(a.status))
const openIncidents = rows => rows.filter(i => !['resolved', 'closed'].includes(i.status))

const organizationMetrics = computed(() => {
  if (!organization.value) return []
  const orgId = organization.value.id
  const sensors = scopeRows('sensors')
  const alerts = scopeRows('alerts')
  const assets = scopeRows('assets')
  return [
    { key: 'staff', value: seatsUsed(orgId), caption: `${ui('outOf')} ${seatCapacity(orgId)} ${ui('seats')}`, icon: 'users', tone: '' },
    { key: 'sensors', value: sensors.length, caption: `${sensors.filter(s => s.connection === 'online').length} ${ui('connected')}`, icon: 'wifi', tone: 'success' },
    { key: 'equipment', value: assets.length, caption: `${assets.filter(a => a.status === 'compliant').length} ${ui('compliant')}`, icon: 'box', tone: 'success' },
    { key: 'openAlerts', value: activeAlerts(alerts).length, caption: ui('requiresReview'), icon: 'bell', tone: activeAlerts(alerts).length ? 'warning' : 'success' }
  ]
})

const globalMetrics = computed(() => {
  const alerts = activeAlerts(demo.data.alerts)
  const incidents = openIncidents(demo.data.incidents)
  const connected = demo.data.sensors.filter(s => s.connection === 'online').length
  return [
    { key: 'companies', value: demo.organizations.length, caption: ui('onboarded'), icon: 'building', tone: '' },
    { key: 'activeSubscriptions', value: allSubscriptions.value.filter(s => s.status === 'active').length, caption: ui('activePlans'), icon: 'credit-card', tone: 'success' },
    { key: 'users', value: allUsers.value.length, caption: ui('allOrganizations'), icon: 'users', tone: '' },
    { key: 'onlineSensors', value: connected, caption: `${ui('outOf')} ${demo.data.sensors.length} ${ui('sensors')}`, icon: 'wifi', tone: 'success' },
    { key: 'openAlerts', value: alerts.length, caption: ui('requiresReview'), icon: 'bell', tone: alerts.length ? 'warning' : 'success' },
    { key: 'openIncidents', value: incidents.length, caption: ui('inFollowUp'), icon: 'exclamation-triangle', tone: incidents.length ? 'danger' : 'success' },
    { key: 'monthlyPlans', value: money(allSubscriptions.value.filter(s => s.status === 'active').reduce((sum,s) => sum+s.monthlyCost,0)), caption: ui('contractedAmounts'), icon: 'wallet', tone: '' },
    { key: 'upcomingReceipts', value: allInvoices.value.filter(i => i.status === 'upcoming').length, caption: ui('nextBillingCycle'), icon: 'file', tone: 'warning' }
  ]
})
const orgListMetrics = computed(() => [
  { key: 'companies', value: demo.organizations.length, caption: ui('registered'), icon: 'building' },
  { key: 'activeOrganizations', value: demo.organizations.filter(o => o.status === 'active').length, caption: ui('enabledOrganizations'), icon: 'check-circle', tone: 'success' },
  { key: 'laboratories', value: demo.organizations.filter(o => o.segment === 'laboratory').length, caption: ui('laboratorySegment'), icon: 'heart', tone: '' },
  { key: 'pharmaceuticals', value: demo.organizations.filter(o => o.segment === 'pharmaceutical').length, caption: ui('pharmaceuticalSegment'), icon: 'building', tone: '' }
])
const userMetrics = computed(() => [
  { key: 'users', value: allUsers.value.length, caption: ui('allOrganizations'), icon: 'users' },
  { key: 'activeUsers', value: allUsers.value.filter(u => u.status === 'active').length, caption: ui('enabledAccounts'), icon: 'user', tone: 'success' },
  { key: 'managers', value: allUsers.value.filter(u => u.role === 'organizationAdmin').length, caption: ui('onePerCompany'), icon: 'briefcase', tone: '' },
  { key: 'pendingUsers', value: allUsers.value.filter(u => u.status !== 'active').length, caption: ui('awaitingAccess'), icon: 'clock', tone: 'warning' }
])
const billingMetrics = computed(() => [
  { key: 'activeSubscriptions', value: allSubscriptions.value.filter(s => s.status === 'active').length, caption: ui('activePlans'), icon: 'credit-card', tone: 'success' },
  { key: 'monthlyPlans', value: money(allSubscriptions.value.filter(s => s.status === 'active').reduce((sum,s)=>sum+s.monthlyCost,0)), caption: ui('contractedAmounts'), icon: 'wallet' },
  { key: 'extraSeats', value: allSubscriptions.value.reduce((sum,s)=>sum+(s.additionalSeats||0),0), caption: ui('additionalLicenses'), icon: 'users', tone: '' },
  { key: 'upcomingReceipts', value: allInvoices.value.filter(i => i.status === 'upcoming').length, caption: ui('nextBillingCycle'), icon: 'calendar', tone: 'warning' }
])
const auditMetrics = computed(() => [
  { key: 'auditRecords', value: allAudits.value.length, caption: ui('trackedActions'), icon: 'history' },
  { key: 'reviewed', value: allAudits.value.filter(a => a.status === 'reviewed').length, caption: ui('verifiedEvents'), icon: 'check-circle', tone: 'success' },
  { key: 'pendingReview', value: allAudits.value.filter(a => a.status === 'pending').length, caption: ui('requiresReview'), icon: 'clock', tone: 'warning' },
  { key: 'criticalEvents', value: allAudits.value.filter(a => a.severity === 'critical').length, caption: ui('highPriorityEvents'), icon: 'exclamation-triangle', tone: 'danger' }
])

// This page shows only summaries; search and filters belong to PlatformRecordsView.
const companyRows = computed(() => demo.organizations)
const userRows = computed(() => allUsers.value)
const subscriptionRows = computed(() => allSubscriptions.value)
const auditRows = computed(() => [...allAudits.value].sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || '')))
const recentAudits = computed(() => [...allAudits.value].sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0,5))
const upcomingInvoices = computed(() => allInvoices.value.filter(i => i.status === 'upcoming').sort((a,b)=>(a.dueDate || '').localeCompare(b.dueDate || '')))
const companySummary = computed(() => demo.organizations.map(o => {
  const sensors = demo.data.sensors.filter(s => s.organizationId === o.id)
  const alerts = demo.data.alerts.filter(a => a.organizationId === o.id)
  return { ...o, sensors: sensors.length, online: sensors.filter(s => s.connection === 'online').length,
    openAlerts: activeAlerts(alerts).length, seatsUsed: seatsUsed(o.id), seatCapacity: seatCapacity(o.id), subscription: demo.subscriptionFor(o.id) }
}))

function editSensor(sensor) {
  sensorDraft.value = { id:sensor.id, value:sensor.value, connection:sensor.connection, status:sensor.status }
  saveMessage.value = ''
}
function saveSensor() {
  const current = demo.data.sensors.find(s => s.id === sensorDraft.value?.id && s.organizationId === organization.value?.id)
  if (!current || !Number.isFinite(Number(sensorDraft.value.value))) return
  Object.assign(current, { value:Number(sensorDraft.value.value), connection:sensorDraft.value.connection,
    status:sensorDraft.value.status, lastReading:new Date().toISOString() })
  demo.persist()
  demo.addAudit({ actor:'SafeLab Administrator', action:`Updated sensor ${current.code} for ${organization.value.name}`,
    module:'Sensor Monitoring', organizationId:organization.value.id })
  sensorDraft.value = null
  saveMessage.value = t('multi.saved')
}
function exportCurrent() {
  if (organization.value) {
    const orgId = organization.value.id
    const mapping = {
      overview: demo.data.facilities.filter(f => f.organizationId === orgId),
      users: organizationUsers.value.map(({password,...u})=>u),
      devices: [...scopeRows('assets'),...scopeRows('sensors')],
      billing: currentInvoices.value,
      operations: [...scopeRows('alerts'),...scopeRows('incidents')]
    }
    return downloadCsv(`safelab-${orgId}-${orgTab.value}`, mapping[orgTab.value])
  }
  const mapping = {
    organizations: companyRows.value,
    users: userRows.value.map(({password,...u})=>u),
    subscriptions: subscriptionRows.value.map(({invoices,...s})=>s),
    activity: auditRows.value,
    overview: companySummary.value
  }
  return downloadCsv(`safelab-platform-${page.value}`, mapping[page.value] || [])
}
watch(() => route.fullPath, () => {
  orgTab.value = String(route.query.tab || 'overview'); sensorDraft.value = null; saveMessage.value = ''
})
</script>

<template>
  <section class="page platform-page">
    <header class="page-hero compact">
      <p class="eyebrow">SafeLab Platform</p>
      <h1>{{ title }}</h1>
      <p>{{ organization ? t('multi.orgDetailDescription') : t(`multi.platformHelp_${page}`) }}</p>
    </header>

    <!-- Organization drill-down: all operations stay scoped to this company. -->
    <template v-if="organization">
      <div class="platform-actions">
        <button class="btn" type="button" @click="backFromOrganization"><i class="pi pi-arrow-left"></i> {{t('multi.platform_organizations')}}</button>
        <button class="btn" type="button" @click="exportCurrent"><i class="pi pi-download"></i> CSV</button>
      </div>
      <div class="kpi-grid">
        <PlatformMetricCard v-for="item in organizationMetrics" :key="item.key"
          :label="ui(item.key)" :value="item.value" :caption="item.caption" :icon="item.icon" :tone="item.tone"/>
      </div>
      <nav class="platform-tabs" :aria-label="ui('organizationSections')">
        <button v-for="tab in ['overview','users','devices','billing','operations']" :key="tab"
          type="button" :class="['btn', {primary:orgTab===tab}]" @click="orgTab=tab">{{t(`multi.tab_${tab}`)}}</button>
      </nav>

      <article v-if="orgTab==='overview'" class="card">
        <div class="card-header"><h2>{{t('multi.orgData')}}</h2><PlatformStatusBadge :status="organization.status"/></div>
        <div class="pair-grid">
          <div v-for="item in [
            [t('multi.name'),organization.name], ['RUC',organization.ruc],
            [t('multi.segment'),organization.segment], [t('multi.email'),organization.corporateEmail],
            [t('multi.city'),organization.city], [t('multi.manager'),managerName(organization)],
            [t('multi.plan'),currentSubscription?.plan || '—'],[t('multi.nextDue'),date(currentSubscription?.renewalDate)]
          ]" :key="item[0]" class="pair-box"><span>{{item[0]}}</span><strong>{{item[1]}}</strong></div>
        </div>
        <h3><button class="platform-heading-button" @click="openRecords('facilities', organization.id,'overview')">{{t('multi.facilities')}} <i class="pi pi-arrow-up-right"></i></button></h3>
        <div class="item-list"><div v-for="facility in preview(scopeRows('facilities'), 4)" :key="facility.id" class="list-row"><strong>{{facility.name}}</strong><span>{{facility.city}}</span></div></div>
      </article>

      <article v-else-if="orgTab==='users'" class="card platform-summary-card" @click="openSummary($event,'users',organization.id,'users')">
        <div class="card-header"><div><h2>{{t('multi.users')}}</h2><p>{{t('multi.usersHint')}}</p></div><span class="platform-hint">{{seatsUsed(organization.id)}} / {{seatCapacity(organization.id)}} {{ui('seats')}}</span><button type="button" class="btn small" @click="openRecords('users',organization.id,'users')">{{ui('viewAll')}} <i class="pi pi-arrow-right"></i></button></div>
        <div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.name')}}</th><th>{{t('multi.email')}}</th><th>{{t('multi.role')}}</th><th>{{t('multi.status')}}</th></tr></thead>
          <tbody><tr v-for="u in preview(organizationUsers, 4)" :key="u.id"><td><strong>{{u.fullName}}</strong></td><td>{{u.email}}</td><td>{{t(`multi.role_${u.role}`)}}</td><td><PlatformStatusBadge :status="u.status"/></td></tr></tbody></table></div>
      </article>

      <article v-else-if="orgTab==='devices'" class="card platform-summary-card" @click="openSummary($event,'assets',organization.id,'devices')">
        <div class="card-header"><div><h2>{{t('multi.devices')}}</h2><p>{{t('multi.deviceHint')}}</p></div><button class="btn small" type="button" @click="openRecords('assets',organization.id,'devices')">{{ui('viewAll')}} <i class="pi pi-arrow-right"></i></button></div>
        <h3><button class="platform-heading-button" @click="openRecords('assets',organization.id,'devices')">{{t('multi.equipment')}} <i class="pi pi-arrow-up-right"></i></button></h3>
        <div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.name')}}</th><th>{{t('multi.facilities')}}</th><th>{{t('multi.status')}}</th></tr></thead>
          <tbody><tr v-for="a in preview(scopeRows('assets'), 4)" :key="a.id"><td>{{a.name}}</td><td>{{demo.data.facilities.find(f=>f.id===a.facilityId)?.name}}</td><td><PlatformStatusBadge :status="a.status"/></td></tr></tbody></table></div>
        <h3 class="platform-subheading"><button class="platform-heading-button" @click="openRecords('sensors', organization.id,'devices')">{{t('multi.sensors')}} <i class="pi pi-arrow-up-right"></i></button></h3>
        <div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.name')}}</th><th>{{t('multi.equipment')}}</th><th>{{t('multi.reading')}}</th><th>{{t('multi.status')}}</th><th></th></tr></thead>
          <tbody><tr v-for="s in preview(scopeRows('sensors'), 4)" :key="s.id"><td>{{s.name}}</td><td>{{demo.data.assets.find(a=>a.id===s.assetId)?.name}}</td><td>{{s.value}} {{s.unit}}</td><td><PlatformStatusBadge :status="s.connection"/></td><td><button class="btn small" type="button" @click="editSensor(s)">{{t('multi.manage')}}</button></td></tr></tbody></table></div>
      </article>

      <article v-else-if="orgTab==='billing'" class="card platform-summary-card" @click="openSummary($event,'invoices',organization.id,'billing')">
        <div class="card-header"><h2>{{t('multi.platform_subscriptions')}}</h2><PlatformStatusBadge :status="currentSubscription?.status"/><button class="btn small" type="button" @click="openRecords('invoices',organization.id,'billing')">{{ui('viewAll')}} <i class="pi pi-arrow-right"></i></button></div>
        <div class="pair-grid"><div v-for="item in [
          [t('multi.plan'),currentSubscription?.plan], [t('multi.monthly'),money(currentSubscription?.monthlyCost)],
          [ui('staff'),seatsUsed(organization.id)], [t('multi.capacity'),seatCapacity(organization.id)],
          [ui('extraSeats'),currentSubscription?.additionalSeats || 0],[t('multi.nextDue'),date(currentSubscription?.renewalDate)]
        ]" :key="item[0]" class="pair-box"><span>{{item[0]}}</span><strong>{{item[1]}}</strong></div></div>
        <h3><button class="platform-heading-button" @click="openRecords('invoices',organization.id,'billing')">{{ui('paymentHistory')}} <i class="pi pi-arrow-up-right"></i></button></h3>
        <div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.receipt')}}</th><th>{{t('multi.status')}}</th><th>{{t('multi.amount')}}</th><th>{{t('multi.nextDue')}}</th></tr></thead>
          <tbody><tr v-for="invoice in preview(currentInvoices, 4)" :key="invoice.id"><td>{{invoice.number}}</td><td><PlatformStatusBadge :status="invoice.status"/></td><td>{{money(invoice.amount)}}</td><td>{{date(invoice.dueDate)}}</td></tr></tbody></table></div>
      </article>

      <article v-else class="card">
        <div class="card-header"><h2>{{t('multi.tab_operations')}}</h2></div>
        <div class="platform-operation-grid">
          <div><h3><button class="platform-heading-button" @click="openRecords('alerts',organization.id,'operations')">{{t('multi.alerts')}} <i class="pi pi-arrow-up-right"></i></button></h3><button class="btn small platform-sublist-link" @click="openRecords('alerts',organization.id,'operations')">{{ui('viewAll')}} <i class="pi pi-arrow-right"></i></button><div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.name')}}</th><th>{{t('multi.status')}}</th><th>{{t('multi.severity')}}</th></tr></thead><tbody>
            <tr v-for="a in preview(scopeRows('alerts'), 3)" :key="a.id"><td>{{a.title}}</td><td><PlatformStatusBadge :status="a.status==='active'?'open':a.status"/></td><td><PlatformStatusBadge :status="a.severity"/></td></tr></tbody></table></div></div>
          <div><h3><button class="platform-heading-button" @click="openRecords('incidents',organization.id,'operations')">{{t('multi.incidents')}} <i class="pi pi-arrow-up-right"></i></button></h3><button class="btn small platform-sublist-link" @click="openRecords('incidents',organization.id,'operations')">{{ui('viewAll')}} <i class="pi pi-arrow-right"></i></button><div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.name')}}</th><th>{{t('multi.status')}}</th></tr></thead><tbody>
            <tr v-for="incident in preview(scopeRows('incidents'), 3)" :key="incident.id"><td>{{incident.title}}</td><td><PlatformStatusBadge :status="incident.status"/></td></tr></tbody></table></div></div>
        </div>
      </article>
      <p v-if="saveMessage" class="platform-success" role="status">{{saveMessage}}</p>
      <div v-if="sensorDraft" class="modal-backdrop" @click.self="sensorDraft=null">
        <article class="card modal-card" role="dialog" aria-modal="true" :aria-label="t('multi.sensors')">
          <div class="card-header"><h2>{{t('multi.sensors')}}</h2><button class="btn" type="button" @click="sensorDraft=null" aria-label="Close">✕</button></div>
          <form class="edit-sensor-form" @submit.prevent="saveSensor">
            <label>{{t('multi.reading')}}<input v-model.number="sensorDraft.value" class="input" type="number" step="0.01" required/></label>
            <label>{{t('multi.status')}}<select v-model="sensorDraft.status" class="select"><option value="normal">Normal</option><option value="warning">Warning</option><option value="out-of-range">Out of range</option></select></label>
            <label>{{ui('connection')}}<select v-model="sensorDraft.connection" class="select"><option value="online">Online</option><option value="offline">Offline</option><option value="maintenance">Maintenance</option></select></label>
            <div class="actions"><button class="btn primary" type="submit">{{t('multi.saveChanges')}}</button><button class="btn" type="button" @click="sensorDraft=null">{{t('multi.cancel')}}</button></div>
          </form>
        </article>
      </div>
    </template>

    <!-- Platform-wide overview. All figures come from the same shared seed/store. -->
    <template v-else-if="page==='overview'">
      <div class="kpi-grid"><PlatformMetricCard v-for="metric in globalMetrics" :key="metric.key" :label="ui(metric.key)" :value="metric.value" :caption="metric.caption" :icon="metric.icon" :tone="metric.tone"/></div>
      <div class="platform-main-grid">
        <article class="card platform-summary-card" tabindex="0" @click="openSummary($event,'organizations')" @keydown.enter.self="openRecords('organizations')" @keydown.space.self.prevent="openRecords('organizations')">
          <div class="card-header"><div><h2>{{ui('organizationHealth')}}</h2><p>{{ui('organizationHealthHelp')}}</p></div><button class="btn small" type="button" @click="openRecords('organizations')">{{ui('viewAll')}}</button></div>
          <div class="platform-company-list">
            <button v-for="company in preview(companySummary, 5)" :key="company.id" class="platform-company-row" type="button" @click="openOrg(company.id)">
              <span class="company-icon"><i class="pi pi-building"></i></span>
              <span class="company-info"><strong>{{company.name}}</strong><small>{{company.city}} · {{company.seatsUsed}}/{{company.seatCapacity}} {{ui('seats')}}</small></span>
              <span class="company-status"><PlatformStatusBadge :status="company.subscription?.status || company.status"/><small>{{company.openAlerts}} {{ui('openAlerts').toLowerCase()}}</small></span>
              <i class="pi pi-chevron-right"></i>
            </button>
          </div>
          <p v-if="!companySummary.length" class="text-muted">{{ui('noResults')}}</p>
        </article>
        <article class="card platform-summary-card" tabindex="0" @click="openSummary($event,'activity')" @keydown.enter.self="openRecords('activity')" @keydown.space.self.prevent="openRecords('activity')">
          <div class="card-header"><div><h2>{{ui('recentEvents')}}</h2><p>{{ui('recentEventsHelp')}}</p></div><button class="btn small" type="button" @click="openRecords('activity')">{{ui('viewAll')}}</button></div>
          <div class="platform-timeline">
            <div v-for="event in recentAudits" :key="event.id" class="timeline-row">
              <span class="timeline-dot"></span><div><strong>{{event.action}}</strong><small>{{orgName(event.organizationId)}} · {{dateTime(event.createdAt)}}</small></div><PlatformStatusBadge :status="event.status"/>
            </div>
            <p v-if="!recentAudits.length" class="text-muted">{{ui('noResults')}}</p>
          </div>
        </article>
      </div>
      <div class="platform-actions"><button class="btn" @click="exportCurrent"><i class="pi pi-download"></i> {{ui('exportOrganizations')}}</button><button class="btn primary" @click="goto('subscriptions')"><i class="pi pi-credit-card"></i> {{t('multi.platform_subscriptions')}}</button></div>
    </template>

    <template v-else-if="page==='organizations'">
      <div class="kpi-grid"><PlatformMetricCard v-for="metric in orgListMetrics" :key="metric.key" :label="ui(metric.key)" :value="metric.value" :caption="metric.caption" :icon="metric.icon" :tone="metric.tone"/></div>
      
      <article class="card platform-summary-card" tabindex="0" @click="openSummary($event,'organizations')" @keydown.enter.self="openRecords('organizations')"><div class="card-header"><button class="platform-heading-button" type="button" @click="openRecords('organizations')"><h2>{{t('multi.platform_organizations')}} <i class="pi pi-arrow-up-right"></i></h2></button><span class="platform-hint">{{companyRows.length}} {{ui('results')}}</span><button class="btn small" type="button" @click="openRecords('organizations')">{{ui('viewAll')}} <i class="pi pi-arrow-right"></i></button></div>
        <div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.name')}}</th><th>RUC</th><th>{{t('multi.segment')}}</th><th>{{t('multi.manager')}}</th><th>{{ui('employeeCapacity')}}</th><th>{{ui('openAlerts')}}</th><th>{{t('multi.status')}}</th><th></th></tr></thead><tbody>
          <tr v-for="company in preview(companyRows, 3)" :key="company.id"><td><strong>{{company.name}}</strong></td><td>{{company.ruc}}</td><td>{{company.segment==='laboratory'?ui('laboratories'):ui('pharmaceuticals')}}</td><td>{{managerName(company)}}</td><td>{{seatsUsed(company.id)}} / {{seatCapacity(company.id)}}</td><td>{{activeAlerts(demo.data.alerts.filter(a=>a.organizationId===company.id)).length}}</td><td><PlatformStatusBadge :status="company.status"/></td><td><button class="btn small primary" @click="openOrg(company.id)">{{t('multi.details')}}</button></td></tr>
        </tbody></table></div><p v-if="!companyRows.length" class="text-muted">{{ui('noResults')}}</p>
      </article>
    </template>

    <template v-else-if="page==='users'">
      <div class="kpi-grid"><PlatformMetricCard v-for="metric in userMetrics" :key="metric.key" :label="ui(metric.key)" :value="metric.value" :caption="metric.caption" :icon="metric.icon" :tone="metric.tone"/></div>
      
      <article class="card platform-summary-card" tabindex="0" @click="openSummary($event,'users')" @keydown.enter.self="openRecords('users')"><div class="card-header"><button class="platform-heading-button" type="button" @click="openRecords('users')"><h2>{{t('multi.platform_users')}} <i class="pi pi-arrow-up-right"></i></h2></button><span class="platform-hint">{{userRows.length}} {{ui('results')}}</span><button class="btn small" type="button" @click="openRecords('users')">{{ui('viewAll')}} <i class="pi pi-arrow-right"></i></button></div>
        <div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.name')}}</th><th>{{t('multi.email')}}</th><th>{{t('multi.role')}}</th><th>{{t('multi.organization')}}</th><th>{{ui('usesSeat')}}</th><th>{{t('multi.status')}}</th></tr></thead><tbody>
          <tr v-for="user in preview(userRows, 5)" :key="user.id"><td><strong>{{user.fullName}}</strong></td><td>{{user.email}}</td><td>{{t(`multi.role_${user.role}`)}}</td><td><button v-if="user.organizationId" class="text-link" @click="openOrg(user.organizationId)">{{user.organization}}</button><span v-else>SafeLab Platform</span></td><td>{{user.role==='organizationAdmin'||user.role==='platformAdmin'?ui('no'):ui('yes')}}</td><td><PlatformStatusBadge :status="user.status"/></td></tr>
        </tbody></table></div><p v-if="!userRows.length" class="text-muted">{{ui('noResults')}}</p>
      </article>
      <article class="card platform-summary-card" @click="openSummary($event,'users')"><div class="card-header"><h2>{{ui('rolesDistribution')}}</h2></div><div class="platform-role-grid">
        <div v-for="role in [...new Set(allUsers.filter(u=>u.organizationId).map(u=>u.role))]" :key="role" class="pair-box"><span>{{t(`multi.role_${role}`)}}</span><strong>{{allUsers.filter(u=>u.role===role).length}}</strong></div>
      </div></article>
    </template>

    <template v-else-if="page==='subscriptions'">
      <div class="kpi-grid"><PlatformMetricCard v-for="metric in billingMetrics" :key="metric.key" :label="ui(metric.key)" :value="metric.value" :caption="metric.caption" :icon="metric.icon" :tone="metric.tone"/></div>
      
      <article class="card platform-summary-card" tabindex="0" @click="openSummary($event,'subscriptions')" @keydown.enter.self="openRecords('subscriptions')"><div class="card-header"><button class="platform-heading-button" type="button" @click="openRecords('subscriptions')"><h2>{{t('multi.platform_subscriptions')}} <i class="pi pi-arrow-up-right"></i></h2></button><span class="platform-hint">{{subscriptionRows.length}} {{ui('results')}}</span><button class="btn small" type="button" @click="openRecords('subscriptions')">{{ui('viewAll')}} <i class="pi pi-arrow-right"></i></button></div>
        <div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.organization')}}</th><th>{{t('multi.plan')}}</th><th>{{t('multi.status')}}</th><th>{{t('multi.monthly')}}</th><th>{{ui('employeeCapacity')}}</th><th>{{ui('extraSeats')}}</th><th>{{t('multi.nextDue')}}</th></tr></thead><tbody>
          <tr v-for="sub in preview(subscriptionRows, 2)" :key="sub.id"><td><button class="text-link" @click="openOrg(sub.organizationId)">{{orgName(sub.organizationId)}}</button></td><td>{{sub.plan}}</td><td><PlatformStatusBadge :status="sub.status"/></td><td>{{money(sub.monthlyCost)}}</td><td>{{seatsUsed(sub.organizationId)}} / {{seatCapacity(sub.organizationId)}}</td><td>{{sub.additionalSeats || 0}}</td><td>{{date(sub.renewalDate)}}</td></tr>
        </tbody></table></div>
      </article>
      <article class="card platform-summary-card" @click="openSummary($event,'invoices')"><div class="card-header"><div><button class="platform-heading-button" type="button" @click="openRecords('invoices')"><h2>{{ui('upcomingPayments')}} <i class="pi pi-arrow-up-right"></i></h2></button><p>{{ui('upcomingPaymentsHelp')}}</p></div><button class="btn small" type="button" @click="openRecords('invoices')">{{ui('viewAll')}} <i class="pi pi-arrow-right"></i></button></div>
        <div class="platform-receipts"><button v-for="invoice in preview(upcomingInvoices, 2)" :key="invoice.id" class="platform-receipt" @click="openRecords('invoices', invoice.organizationId, 'billing')">
          <span><strong>{{orgName(invoice.organizationId)}}</strong><small>{{invoice.number}} · {{date(invoice.dueDate)}}</small></span><span class="receipt-amount"><strong>{{money(invoice.amount)}}</strong><PlatformStatusBadge :status="invoice.status"/></span><i class="pi pi-chevron-right"></i>
        </button></div><p v-if="!upcomingInvoices.length" class="text-muted">{{ui('noResults')}}</p>
      </article>
    </template>

    <template v-else-if="page==='activity'">
      <div class="kpi-grid"><PlatformMetricCard v-for="metric in auditMetrics" :key="metric.key" :label="ui(metric.key)" :value="metric.value" :caption="metric.caption" :icon="metric.icon" :tone="metric.tone"/></div>
      
      <div class="platform-main-grid">
        <article class="card platform-summary-card" tabindex="0" @click="openSummary($event,'activity')" @keydown.enter.self="openRecords('activity')"><div class="card-header"><button class="platform-heading-button" type="button" @click="openRecords('activity')"><h2>{{ui('auditHistory')}} <i class="pi pi-arrow-up-right"></i></h2></button><span class="platform-hint">{{auditRows.length}} {{ui('results')}}</span><button class="btn small" type="button" @click="openRecords('activity')">{{ui('viewAll')}} <i class="pi pi-arrow-right"></i></button></div>
          <div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.organization')}}</th><th>{{ui('action')}}</th><th>{{t('multi.status')}}</th><th>{{ui('date')}}</th></tr></thead><tbody>
            <tr v-for="event in preview(auditRows, 3)" :key="event.id"><td>{{orgName(event.organizationId)}}</td><td>{{event.action}}</td><td><PlatformStatusBadge :status="event.status"/></td><td>{{date(event.createdAt)}}</td></tr>
          </tbody></table></div><p v-if="!auditRows.length" class="text-muted">{{ui('noResults')}}</p>
        </article>
        <article class="card platform-summary-card" @click="openSummary($event,'activity')"><div class="card-header"><button type="button" class="platform-heading-button" @click="openRecords('activity')"><h2>{{ui('recentEvents')}} <i class="pi pi-arrow-up-right"></i></h2></button></div><div class="platform-timeline"><div v-for="event in preview(recentAudits, 3)" :key="event.id" class="timeline-row"><span class="timeline-dot"></span><div><strong>{{event.action}}</strong><small>{{orgName(event.organizationId)}} · {{dateTime(event.createdAt)}}</small></div><PlatformStatusBadge :status="event.status"/></div></div></article>
      </div>
    </template>

    <PlatformSettingsPanel v-else/>
  </section>
</template>

<style scoped>
/* Summary cards lead to full tables; their embedded buttons keep their own actions. */
.platform-summary-card{cursor:pointer;transition:border-color .15s ease}
.platform-summary-card:hover{border-color:var(--primary)}
.platform-summary-card:focus-visible{outline:3px solid var(--primary);outline-offset:3px}
.platform-heading-button{display:inline-flex;gap:8px;align-items:center;color:var(--text);border:0;padding:0;background:transparent;cursor:pointer;font:inherit;font-weight:inherit;text-align:left}
.platform-heading-button:hover{color:var(--primary)}
.platform-heading-button h2{margin:0}
.platform-heading-button .pi{font-size:.7em;color:var(--primary)}
.platform-summary-card .card-header{flex-wrap:wrap;gap:10px}
.platform-sublist-link{margin:0 0 12px}
/* Components use the same global colors and surfaces as the operational UI. */
.platform-page{gap:20px}.platform-page .page-hero{display:block;padding:26px 28px;min-height:120px}.platform-page .page-hero h1{font-size:clamp(1.8rem,3vw,2.6rem)}.platform-page .page-hero p:last-child{margin-bottom:0}.platform-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap}.platform-tabs{display:flex;flex-wrap:wrap;gap:8px;padding:13px;border-radius:22px;background:var(--surface-card);border:1px solid var(--border)}.platform-filters{display:flex;align-items:center;flex-wrap:wrap;gap:12px;padding:14px;border:1px solid var(--border);border-radius:24px;background:var(--surface-card);box-shadow:var(--shadow)}.platform-filters input{flex:2 1 260px;min-width:140px}.platform-filters select{flex:1 1 170px;min-width:140px}.platform-filters .btn{flex:0 0 auto}.platform-main-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:18px;align-items:start}.platform-main-grid>*{min-width:0}.platform-company-list,.platform-receipts,.platform-timeline{display:grid;gap:10px}.platform-company-row,.platform-receipt{width:100%;display:flex;gap:14px;align-items:center;text-align:left;padding:14px;border:1px solid var(--border);background:var(--surface-muted);border-radius:16px;color:var(--text);cursor:pointer}.platform-company-row:hover,.platform-receipt:hover{border-color:var(--primary)}.company-icon{display:grid;place-items:center;flex:0 0 43px;height:43px;border-radius:14px;color:var(--primary);background:color-mix(in srgb,var(--primary) 12%,transparent)}.company-info,.platform-receipt>span:first-child{display:grid;gap:5px;min-width:0;flex:1}.company-info strong,.platform-receipt strong{overflow-wrap:anywhere}.company-info small,.platform-receipt small,.company-status small{color:var(--muted);display:block}.company-status,.receipt-amount{display:grid;gap:5px;justify-items:end;min-width:0}.timeline-row{display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:12px;align-items:start;padding:12px 0;border-bottom:1px solid var(--border)}.timeline-row:last-child{border-bottom:0}.timeline-row>div{min-width:0;display:grid;gap:5px}.timeline-row strong{overflow-wrap:anywhere;font-size:.88rem}.timeline-row small{color:var(--muted);font-size:.75rem}.timeline-dot{width:10px;height:10px;margin-top:5px;border-radius:50%;background:var(--primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 14%,transparent)}.platform-hint{color:var(--muted);font-size:.82rem;font-weight:800}.platform-subheading{margin-top:24px}.platform-role-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.platform-role-grid .pair-box strong{font-size:1.6rem}.platform-operation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.platform-operation-grid>div{min-width:0}.table-scroll{overflow-x:auto;min-width:0}.platform-page .responsive-table{min-width:680px}.text-link{border:0;padding:0;background:transparent;color:var(--primary);font:inherit;font-weight:750;cursor:pointer;text-align:left}.edit-sensor-form{display:grid;gap:15px}.edit-sensor-form label{display:grid;gap:7px;color:var(--text)}.modal-card{width:min(100%,530px)}.platform-success{color:var(--success);font-weight:750}.platform-page .pair-grid{margin-bottom:22px}@media(max-width:1100px){.platform-main-grid{grid-template-columns:1fr}.platform-role-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.platform-role-grid,.platform-operation-grid{grid-template-columns:1fr}.company-status{display:none}.platform-page .page-hero{padding:22px}.platform-company-row{padding:12px}.platform-filters>*{width:100%;flex:1 1 100%}}
</style>
