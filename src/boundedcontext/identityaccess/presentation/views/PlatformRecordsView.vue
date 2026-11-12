<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
import { downloadCsv } from '@/shared/application/services/csv-export'
import PlatformStatusBadge from '../components/PlatformStatusBadge.vue'

// One full-record screen shared by the SafeLab Platform sections.
// The preview cards and these tables always read the same local store.
const route = useRoute()
const router = useRouter()
const { t, locale, te } = useI18n()
const demo = useSafeLabDemoStore()
const ui = key => t(`platformRecords.${key}`)

const dataset = computed(() => String(route.params.collection || ''))
const organizationId = computed(() => String(route.query.organizationId || ''))
const company = computed(() => demo.organizations.find(o => o.id === organizationId.value))
const allowed = ['facilities', 'organizations', 'users', 'subscriptions', 'invoices', 'activity', 'assets', 'sensors', 'alerts', 'incidents']
const valid = computed(() => allowed.includes(dataset.value) && (!organizationId.value || !!company.value))
const columnsByDataset = {
  facilities: ['name', 'type', 'city', 'manager', 'healthScore', 'complianceScore'],
  organizations: ['name', 'ruc', 'segment', 'manager', 'status'],
  users: ['fullName', 'email', 'role', 'organization', 'status'],
  subscriptions: ['organization', 'plan', 'monthlyCost', 'seats', 'status', 'renewalDate'],
  invoices: ['organization', 'number', 'amount', 'status', 'dueDate'],
  activity: ['organization', 'actor', 'action', 'severity', 'status', 'createdAt'],
  assets: ['name', 'facility', 'category', 'status'],
  sensors: ['code', 'name', 'equipment', 'value', 'connection', 'status'],
  alerts: ['title', 'severity', 'status', 'createdAt'],
  incidents: ['code', 'title', 'severity', 'status', 'createdAt']
}
const columns = computed(() => columnsByDataset[dataset.value] || [])
const orgName = id => demo.organizations.find(o => o.id === id)?.name || 'SafeLab Platform'
const userName = id => demo.data.users.find(u => u.id === id)?.fullName || '—'
const seatCount = id => demo.organizationUsers(id).filter(u => u.role !== 'organizationAdmin' && u.status === 'active').length
const seatCapacity = id => {
  const subscription = demo.subscriptionFor(id)
  return (subscription?.includedSeats || 10) + (subscription?.additionalSeats || 0)
}
const allRows = computed(() => {
  if (!valid.value) return []
  let rows = []
  switch (dataset.value) {
    case 'organizations':
      rows = demo.organizations.map(o => ({ ...o, manager:userName(o.managerId) }))
      break
    case 'users':
      // Authentication secrets must never appear in tables, details or exports.
      rows = demo.data.users.map(({ password, ...user }) => user)
      break
    case 'subscriptions':
      rows = demo.subscriptions.map(({ invoices, ...s }) => ({ ...s, organization:orgName(s.organizationId), seats:`${seatCount(s.organizationId)} / ${seatCapacity(s.organizationId)}` }))
      break
    case 'invoices':
      rows = demo.subscriptions.flatMap(s => (s.invoices || []).map(i => ({ ...i, organizationId:s.organizationId, organization:orgName(s.organizationId) })))
      break
    case 'activity':
      rows = demo.data.auditLogs.map(event => ({ ...event, organization:orgName(event.organizationId) }))
      break
    default:
      rows = (demo.data[dataset.value] || []).map(r => ({ ...r,
        facility:demo.data.facilities.find(f => f.id === r.facilityId)?.name || '—',
        equipment:demo.data.assets.find(a => a.id === r.assetId)?.name || '—'
      }))
  }
  if (organizationId.value) rows = rows.filter(r => r.organizationId === organizationId.value || (dataset.value === 'organizations' && r.id === organizationId.value))
  return rows
})

const search = ref('')
const status = ref('all')
const role = ref('all')
const selected = ref(null)
const page = ref(1)
const pageSize = 8
const availableStatuses = computed(() => [...new Set(allRows.value.map(r => r.status).filter(Boolean))])
const availableRoles = computed(() => dataset.value === 'users' ? [...new Set(allRows.value.map(r => r.role).filter(Boolean))] : [])
const filtered = computed(() => allRows.value.filter(row => {
  const searchText = Object.values(row).filter(v => typeof v !== 'object').join(' ').toLocaleLowerCase()
  return searchText.includes(search.value.toLocaleLowerCase()) &&
    (status.value === 'all' || row.status === status.value) &&
    (role.value === 'all' || row.role === role.value)
}))
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const visible = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch([dataset, organizationId, search, status, role], () => { page.value = 1; selected.value = null })

const money = value => new Intl.NumberFormat(locale.value === 'es' ? 'es-PE' : 'en-US', { style:'currency', currency:'PEN' }).format(Number(value) || 0)
const shortDate = value => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value || '—') : d.toLocaleDateString(locale.value === 'es' ? 'es-PE' : 'en-US')
}
const display = (row, key) => {
  const value = row?.[key]
  if (value == null || value === '') return '—'
  if (key === 'role') return t(`multi.role_${value}`)
  if (key === 'segment') return value === 'laboratory' ? t('platformUi.laboratories') : t('platformUi.pharmaceuticals')
  if (key === 'monthlyCost' || key === 'amount' || key === 'subtotal' || key === 'tax') return money(value)
  if (key === 'createdAt' || key === 'lastReading' || key === 'observedAt') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString(locale.value === 'es' ? 'es-PE' : 'en-US', { dateStyle:'medium', timeStyle:'short' })
  }
  if (['renewalDate', 'dueDate', 'startDate', 'date'].includes(key)) return shortDate(value)
  if (key === 'value' && row.unit) return `${value} ${row.unit}`
  if (typeof value === 'boolean') return value ? ui('yes') : ui('no')
  if (Array.isArray(value)) return value.join(', ') || '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
const isBadge = key => ['status', 'severity', 'connection'].includes(key)
const detailFields = computed(() => selected.value ? Object.keys(selected.value).filter(k => !['password','passwordHash','token','secret','invoices'].includes(k)) : [])
const title = computed(() => t(`platformRecords.title_${dataset.value}`))
// Fields not yet in the dictionary still receive a readable label.
const fieldLabel = key => te(`platformRecords.field_${key}`)
  ? ui(`field_${key}`)
  : String(key).replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_',' ')

const back = () => {
  if (organizationId.value && company.value) return router.push({path:`/platform/organizations/${organizationId.value}`, query:{tab:String(route.query.returnTab || 'overview')}})
  const section = dataset.value === 'invoices' ? 'subscriptions' : dataset.value === 'activity' ? 'activity' : ['assets','sensors','alerts','incidents'].includes(dataset.value) ? 'organizations' : dataset.value
  router.push(`/platform/${section}`)
}
const organizationDetail = id => router.push(`/platform/organizations/${id}`)
// Organizations have their own comprehensive console. Other collections retain
// the existing record-detail modal so this change affects only company rows.
function openRecord(row) {
  if (dataset.value === 'organizations') {
    return router.push({ path: `/platform/organizations/${row.id}`, query: { from: 'records' } })
  }
  selected.value = row
}
function exportRows() {
  const safe = filtered.value.map(row => Object.fromEntries(columns.value.map(key => [fieldLabel(key),display(row,key)])))
  downloadCsv(`safelab-platform-${dataset.value}`, safe)
}
</script>

<template>
  <section class="page platform-records">
    <header class="page-hero compact records-hero">
      <div><p class="eyebrow">SafeLab Platform</p><h1>{{valid ? title : ui('notFound')}}</h1>
        <p>{{company ? `${company.name} · ${ui('fullDescription')}` : ui('fullDescription')}}</p></div>
      <button class="btn" type="button" @click="back"><i class="pi pi-arrow-left"></i> {{ui('back')}}</button>
    </header>
    <template v-if="valid">
      <article class="card records-card">
        <div class="records-toolbar">
          <div class="records-field records-search"><label for="platform-search">{{ui('search')}}</label><input id="platform-search" v-model="search" class="input" :placeholder="ui('searchHint')"/></div>
          <div v-if="availableStatuses.length" class="records-field"><label for="platform-status">{{ui('status')}}</label><select id="platform-status" v-model="status" class="select"><option value="all">{{ui('allStatuses')}}</option><option v-for="state in availableStatuses" :key="state" :value="state">{{te(`platformUi.state_${state.replaceAll('-','_')}`) ? t(`platformUi.state_${state.replaceAll('-','_')}`) : state}}</option></select></div>
          <div v-if="availableRoles.length" class="records-field"><label for="platform-role">{{ui('role')}}</label><select id="platform-role" v-model="role" class="select"><option value="all">{{ui('allRoles')}}</option><option v-for="item in availableRoles" :key="item" :value="item">{{t(`multi.role_${item}`)}}</option></select></div>
          <span class="records-count">{{filtered.length}} {{ui('results')}}</span>
          <button class="btn" type="button" :disabled="!filtered.length" @click="exportRows"><i class="pi pi-download"></i> CSV</button>
        </div>
        <div class="records-scroll"><table class="records-table"><thead><tr><th v-for="field in columns" :key="field">{{fieldLabel(field)}}</th><th>{{ui('details')}}</th></tr></thead>
          <tbody><tr v-for="row in visible" :key="row.id || row.number || row.code" class="records-row" tabindex="0" :aria-label="dataset === 'organizations' ? `${ui('viewOrganization')}: ${row.name}` : `${ui('details')}: ${row.fullName || row.name || row.number || row.code || row.id}`" @click="openRecord(row)" @keydown.enter.prevent="openRecord(row)" @keydown.space.prevent="openRecord(row)">
            <td v-for="field in columns" :key="field"><PlatformStatusBadge v-if="isBadge(field)" :status="row[field] || ''" :context="dataset==='alerts'?'alerts':''"/><span v-else>{{display(row,field)}}</span></td>
            <td><button class="btn small" type="button" @click.stop="openRecord(row)">{{ui('details')}} <i class="pi pi-arrow-right"></i></button></td>
          </tr><tr v-if="!visible.length"><td class="records-empty" :colspan="columns.length+1">{{ui('noResults')}}</td></tr></tbody>
        </table></div>
        <footer class="records-footer"><span>{{ui('page')}} {{page}} / {{pages}}</span><div class="actions"><button class="btn small" type="button" :disabled="page===1" @click="page--">{{ui('previous')}}</button><button class="btn small" type="button" :disabled="page===pages" @click="page++">{{ui('next')}}</button></div></footer>
      </article>
    </template>
    <article v-else class="card"><p>{{ui('notFound')}}</p><button class="btn" @click="back">{{ui('back')}}</button></article>
    <div v-if="selected && dataset !== 'organizations'" class="modal-backdrop" @click.self="selected=null">
      <article class="card records-modal" role="dialog" aria-modal="true" :aria-label="ui('details')">
        <div class="card-header"><div><p class="eyebrow">{{ui('recordDetails')}}</p><h2>{{selected.fullName || selected.name || selected.number || selected.code || selected.id}}</h2></div><button class="btn" type="button" @click="selected=null"><i class="pi pi-times"></i> {{ui('close')}}</button></div>
        <div class="pair-grid"><div v-for="field in detailFields" :key="field" class="pair-box"><span>{{fieldLabel(field)}}</span><PlatformStatusBadge v-if="isBadge(field)" :status="selected[field] || ''" :context="dataset==='alerts'?'alerts':''"/><strong v-else>{{display(selected,field)}}</strong></div></div>
        <div class="records-modal-actions"><button v-if="selected.organizationId && dataset!=='organizations'" class="btn" @click="organizationDetail(selected.organizationId)">{{ui('viewOrganization')}}</button><button v-if="dataset==='subscriptions'" class="btn" @click="router.push({path:'/platform/records/invoices',query:{organizationId:selected.organizationId,returnTab:'billing'}})">{{ui('title_invoices')}}</button><button class="btn primary" @click="selected=null">{{ui('close')}}</button></div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.records-hero{display:flex!important;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.records-card{padding:24px;min-width:0}
.records-toolbar{display:flex;align-items:end;flex-wrap:wrap;gap:12px;margin-bottom:20px}
.records-field{min-width:155px;display:grid;gap:7px}
.records-field label{font-size:.75rem;color:var(--muted);font-weight:800;text-transform:uppercase}
.records-search{flex:1 1 270px}.records-field:not(.records-search){flex:0 1 190px}
.records-count{font-size:.85rem;color:var(--muted);font-weight:750;margin-left:auto}
.records-scroll{max-width:100%;overflow-x:auto;border:1px solid var(--border);border-radius:16px}
.records-table{width:100%;min-width:max-content;border-collapse:collapse;table-layout:auto}
.records-table th,.records-table td{text-align:left;padding:14px 15px;border-bottom:1px solid var(--border);vertical-align:top;max-width:320px;min-width:125px;overflow-wrap:anywhere;white-space:normal}
.records-table th{background:var(--surface-muted);font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.035em}
.records-table td{font-size:.92rem;color:var(--text);line-height:1.5}
.records-row{cursor:pointer}.records-row:hover,.records-row:focus-visible{background:var(--surface-muted);outline-offset:-2px}
.records-empty{color:var(--muted)!important;text-align:center!important;padding:30px!important}
.records-footer{margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--muted);flex-wrap:wrap}
.records-modal{width:min(940px,95vw);max-height:86vh;overflow-y:auto}.records-modal .pair-box strong{overflow-wrap:anywhere}.records-modal-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:10px}
@media(max-width:700px){.records-card{padding:14px}.records-field{flex:1 1 100%!important}.records-count{margin-left:0}.records-hero{align-items:stretch}}
</style>
