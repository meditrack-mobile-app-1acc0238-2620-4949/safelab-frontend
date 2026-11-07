<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/boundedcontext/identityaccess/application/stores/auth.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
import { downloadCsv } from '@/shared/application/services/csv-export'
import LocalizedStatusBadge from '@/shared/presentation/components/LocalizedStatusBadge.vue'

const route = useRoute()
const router = useRouter()
const { t, te, locale } = useI18n()
const auth = useAuthStore()
const demo = useSafeLabDemoStore()
auth.restoreSession()

// The same local repository powers summaries and full record views.
const allowed = {
  dashboardinsights: ['facilities', 'assets', 'sensors', 'alerts', 'incidents', 'reports', 'auditLogs', 'complianceRules'],
  facilityassets: ['facilities', 'assets'],
  equipmentmaintenance: ['assets', 'maintenanceRecords'],
  sensormonitoring: ['sensors'],
  environmentalcompliance: ['complianceRules', 'complianceEvaluations', 'complianceViolations', 'incidents'],
  alertsincidents: ['alerts', 'incidents', 'notifications'],
  remoteactuation: ['actuators', 'remoteCommands'],
  reportinganalytics: ['reports', 'alerts'],
  audittraceability: ['auditLogs', 'remoteCommands', 'reports', 'incidents'],
  subscriptionbilling: ['invoices']
}

const fields = {
  facilities: ['id', 'name', 'type', 'city', 'manager', 'healthScore', 'complianceScore'],
  assets: ['id', 'name', 'category', 'facilityId', 'location', 'responsible', 'status'],
  sensors: ['code', 'name', 'type', 'assetId', 'value', 'unit', 'connection', 'status', 'lastReading'],
  maintenanceRecords: ['id', 'equipmentId', 'type', 'date', 'status', 'responsible', 'notes'],
  complianceRules: ['id', 'title', 'sensorId', 'type', 'min', 'max', 'status'],
  complianceEvaluations: ['id', 'ruleId', 'sensorId', 'value', 'observedAt', 'status'],
  complianceViolations: ['id', 'evaluationId', 'incidentCode', 'startedAt', 'endedAt', 'severity', 'status'],
  alerts: ['id', 'title', 'sensorId', 'facilityId', 'severity', 'status', 'assignedTo', 'createdAt'],
  incidents: ['code', 'title', 'relatedSensorId', 'severity', 'status', 'assignedTo', 'dueDate'],
  notifications: ['id', 'title', 'context', 'severity', 'unread', 'createdAt'],
  actuators: ['code', 'name', 'type', 'status', 'safetyState', 'linkedSensorId', 'lastCommand'],
  remoteCommands: ['id', 'command', 'device', 'status', 'requestedBy', 'createdAt'],
  reports: ['id', 'title', 'type', 'status', 'format', 'generatedAt'],
  auditLogs: ['id', 'actor', 'action', 'module', 'severity', 'status', 'evidence', 'createdAt'],
  invoices: ['number', 'date', 'dueDate', 'amount', 'subtotal', 'tax', 'status', 'reference']
}

const context = computed(() => String(route.meta.sidebarContext || ''))
const dataset = computed(() => String(route.params.dataset || ''))
const validDataset = computed(() => (allowed[context.value] || []).includes(dataset.value))
const columns = computed(() => fields[dataset.value] || [])
const source = computed(() => {
  if (!validDataset.value) return []
  if (dataset.value === 'maintenanceRecords') {
    const ids = new Set(demo.scopedItems('assets', auth.currentUser, 'all').map((item) => item.id))
    return demo.maintenanceRecords.filter((record) => ids.has(record.equipmentId))
  }
  if (dataset.value === 'invoices') {
    return auth.isOrganizationAdmin ? (demo.subscriptionFor(auth.currentUser.organizationId)?.invoices || []) : []
  }
  if (dataset.value === 'remoteCommands') {
    const ids = new Set(demo.scopedItems('actuators', auth.currentUser, 'all').map((item) => item.id))
    return demo.remoteCommands.filter((command) => ids.has(command.actuatorId))
  }
  if (dataset.value === 'complianceRules') {
    const sensors = demo.scopedItems('sensors', auth.currentUser, 'all')
    const ids = new Set(sensors.map((sensor) => sensor.id))
    return demo.complianceRules.filter((rule) => ids.has(rule.sensorId))
  }
  if (dataset.value === 'complianceEvaluations' || dataset.value === 'complianceViolations') {
    const ids = new Set(demo.scopedItems('sensors', auth.currentUser, 'all').map((sensor) => sensor.id))
    return dataset.value === 'complianceEvaluations'
      ? demo.complianceEvaluations.filter((item) => ids.has(item.sensorId))
      : demo.complianceViolations.filter((item) => ids.has(demo.complianceEvaluations.find((e) => e.id === item.evaluationId)?.sensorId))
  }
  return demo.scopedItems(dataset.value, auth.currentUser, 'all')
})

const query = ref('')
const selectedStatus = ref('all')
const page = ref(1)
const pageSize = 10
const selectedRow = ref(null)
const datasetTitle = computed(() => t(`records.datasets.${dataset.value}`))
const statuses = computed(() => [...new Set(source.value.map((item) => item.status || item.connection || '').filter(Boolean))])
const filtered = computed(() => source.value.filter((item) => {
  const matchesQuery = Object.values(item).some((value) => String(value ?? '').toLocaleLowerCase().includes(query.value.toLocaleLowerCase()))
  const matchesStatus = selectedStatus.value === 'all' || (item.status || item.connection) === selectedStatus.value
  return matchesQuery && matchesStatus
}))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const visible = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch([dataset, query, selectedStatus], () => { page.value = 1; selectedRow.value = null })

function fieldLabel(key) {
  const translationKey = `records.fields.${key}`
  return te(translationKey) ? t(translationKey) : String(key).replace(/([a-z])([A-Z])/g, '$1 $2')
}
function formatValue(value, key = '') {
  if (value === undefined || value === null || value === '') return '—'
  if (['status', 'severity', 'connection', 'safetyState'].includes(key)) {
    const key = `platformUi.state_${String(value).toLowerCase().replaceAll(/[\s-]+/g, '_')}`
    return te(key) ? t(key) : String(value)
  }
  if (typeof value === 'boolean') return value ? t('records.yes') : t('records.no')
  if (key === 'amount' || key === 'subtotal' || key === 'tax') {
    return new Intl.NumberFormat(locale.value === 'es' ? 'es-PE' : 'en-US', { style: 'currency', currency: 'PEN' }).format(Number(value) || 0)
  }
  if (key === 'observedAt' || key === 'startedAt' || key === 'endedAt' || key === 'createdAt' || key === 'lastReading' || key === 'generatedAt') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat(locale.value === 'es' ? 'es-PE' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }
  return String(value)
}
function fieldValue(record, key) {
  if (key === 'equipmentId') return demo.assets.find((asset) => asset.id === record.equipmentId)?.name || record.equipmentId
  if (key === 'facilityId') return demo.facilities.find((facility) => facility.id === record.facilityId)?.name || record.facilityId
  if (key === 'assetId') return demo.assets.find((asset) => asset.id === record.assetId)?.name || record.assetId
  if (key === 'sensorId' || key === 'relatedSensorId' || key === 'linkedSensorId') {
    return demo.sensors.find((sensor) => sensor.id === record[key])?.name || record[key]
  }
  if (key === 'title' && locale.value === 'es' && record.titleEs) return record.titleEs
  return record[key]
}
function isStatus(key) { return ['status', 'connection', 'severity'].includes(key) }
function back() {
  // Direct links should also have a meaningful destination.
  if (window.history.state?.back) router.back()
  else router.push(`/${context.value}`)
}
function exportCsv(){
  if(!auth.hasPermission('reports.export'))return
  downloadCsv(`safelab-${dataset.value}`,filtered.value.map(item=>Object.fromEntries(columns.value.map(key=>[fieldLabel(key),formatValue(fieldValue(item,key),key)]))))
}
</script>

<template>
  <section class="page records-page">
    <div class="page-hero compact records-hero">
      <div>
        <p class="eyebrow">{{ t('records.fullRecords') }}</p>
        <h1>{{ validDataset ? datasetTitle : t('records.notFound') }}</h1>
        <p>{{ t('records.description') }}</p>
      </div>
      <button class="btn records-back" type="button" @click="back"><i class="pi pi-arrow-left" />{{ t('records.back') }}</button>
    </div>
    <article v-if="validDataset" class="card records-card">
      <div class="records-toolbar">
        <div class="field records-search"><label for="record-search">{{ t('records.search') }}</label><input id="record-search" v-model="query" class="input" :placeholder="t('records.searchHint')" /></div>
        <div v-if="statuses.length" class="field"><label for="record-status">{{ t('records.status') }}</label><select id="record-status" v-model="selectedStatus" class="select"><option value="all">{{ t('records.allStatuses') }}</option><option v-for="item in statuses" :key="item" :value="item">{{ formatValue(item,'status') }}</option></select></div>
        <div class="records-actions"><span class="records-count">{{ filtered.length }} {{ t('records.results') }}</span><button v-if="auth.hasPermission('reports.export')" class="btn" type="button" :disabled="!filtered.length" @click="exportCsv"><i class="pi pi-download" /> {{ t('records.export') }}</button></div>
      </div>
      <div class="records-table-scroll">
        <table class="records-table">
          <thead><tr><th v-for="key in columns" :key="key">{{ fieldLabel(key) }}</th><th>{{ t('records.details') }}</th></tr></thead>
          <tbody>
            <tr v-for="(record, index) in visible" :key="record.id || record.code || record.number || index" class="records-row" tabindex="0" @click="selectedRow=record" @keydown.enter.prevent="selectedRow=record" @keydown.space.prevent="selectedRow=record">
              <td v-for="key in columns" :key="key"><LocalizedStatusBadge v-if="isStatus(key)" :status="record[key]" :context="dataset==='alerts'?'alerts':dataset==='complianceViolations'?'violations':''"/><span v-else>{{ formatValue(fieldValue(record, key), key) }}</span></td>
              <td><button class="btn small" type="button" @click.stop="selectedRow=record">{{ t('records.details') }} <i class="pi pi-arrow-right" /></button></td>
            </tr>
            <tr v-if="!visible.length"><td :colspan="columns.length + 1" class="records-empty">{{ t('records.empty') }}</td></tr>
          </tbody>
        </table>
      </div>
      <footer class="records-pagination"><span>{{ t('records.page') }} {{ page }} / {{ totalPages }}</span><div class="actions"><button class="btn small" type="button" :disabled="page===1" @click="page--">{{ t('records.previous') }}</button><button class="btn small" type="button" :disabled="page===totalPages" @click="page++">{{ t('records.next') }}</button></div></footer>
    </article>
    <article v-else class="card"><p>{{ t('records.notFoundDescription') }}</p><button class="btn" type="button" @click="back">{{ t('records.back') }}</button></article>

    <div v-if="selectedRow" class="modal-backdrop" @click.self="selectedRow=null">
      <article class="card modal-card records-detail" role="dialog" aria-modal="true" :aria-label="t('records.details')">
        <header class="modal-header"><div><p class="eyebrow">{{ t('records.recordDetails') }}</p><h2>{{ selectedRow.code || selectedRow.number || selectedRow.id || datasetTitle }}</h2></div><button class="icon-action" type="button" :aria-label="t('records.close')" @click="selectedRow=null"><i class="pi pi-times" /></button></header>
        <div class="pair-grid"><div v-for="(value,key) in selectedRow" :key="key" class="pair-box"><span>{{ fieldLabel(key) }}</span><strong>{{ formatValue(fieldValue(selectedRow,key),key) }}</strong></div></div>
        <div class="modal-footer"><button class="btn primary" type="button" @click="selectedRow=null">{{ t('records.close') }}</button></div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.records-hero{display:flex!important;justify-content:space-between;align-items:center;gap:24px}
.records-hero h1{font-size:clamp(1.7rem,2.5vw,2.6rem);margin:5px 0 6px;letter-spacing:-.04em}
.records-hero p:last-child{color:var(--muted);margin:0}
.records-back{white-space:nowrap}
.records-card{padding:24px;min-width:0}
.records-toolbar{display:flex;align-items:end;flex-wrap:wrap;gap:15px;margin-bottom:20px}
.records-search{flex:1 1 300px;min-width:200px}
.records-toolbar .field{min-width:180px}
.records-actions{margin-left:auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.records-count{color:var(--muted);font-weight:750}
.records-table-scroll{width:100%;overflow-x:auto;border:1px solid var(--border);border-radius:16px}
.records-table{width:100%;min-width:max-content;border-collapse:collapse;table-layout:auto}
.records-table th,.records-table td{text-align:left;padding:14px 16px;border-bottom:1px solid var(--border);vertical-align:top;max-width:300px;min-width:115px;overflow-wrap:anywhere;white-space:normal}
.records-table th{background:var(--surface-muted);color:var(--muted);font-size:.76rem;text-transform:uppercase;letter-spacing:.04em}
.records-table td{color:var(--text);font-size:.93rem;line-height:1.5}
.records-row{cursor:pointer}
.records-row:hover,.records-row:focus-visible{background:var(--surface-muted);outline-offset:-2px}
.records-empty{text-align:center!important;color:var(--muted)!important;padding:30px!important}
.records-pagination{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-top:20px;color:var(--muted)}
.records-detail{max-width:900px;width:min(900px,94vw);max-height:85vh;overflow-y:auto}
.records-detail .pair-box strong{overflow-wrap:anywhere}
@media(max-width:720px){.records-hero{align-items:stretch;flex-direction:column}.records-actions{margin-left:0}.records-card{padding:15px}.records-table th,.records-table td{min-width:110px}.records-pagination{flex-wrap:wrap}}
</style>
