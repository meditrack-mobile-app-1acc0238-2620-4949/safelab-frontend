<script setup>
import LocalizedStatusBadge from '@/shared/presentation/components/LocalizedStatusBadge.vue'
import { downloadCsv } from '@/shared/application/services/csv-export'
import ContextPageHeading from '@/shared/presentation/components/ContextPageHeading.vue'
import { useRecordNavigation } from '@/shared/presentation/composables/useRecordNavigation'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/boundedcontext/identityaccess/application/stores/auth.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'

const auth = useAuthStore()
const demo = useSafeLabDemoStore()
auth.restoreSession()

const selectedMetric = ref('healthScore')
const visibleWidgets = ref(['compliance', 'alerts', 'facilities', 'risks', 'trends', 'workflow'])
const user = computed(() => auth.currentUser)
const facilities = computed(() => demo.scopedFacilities(user.value))
const summary = computed(() => demo.dashboardSummary(user.value))
const selectedFacility = computed(() => facilities.value.find((facility) => facility.id === demo.selectedFacilityId) || null)
const alerts = computed(() => demo.scopedItems('alerts', user.value).filter((alert) => alert.status !== 'resolved'))
const incidents = computed(() => demo.scopedItems('incidents', user.value).filter((incident) => !['closed', 'resolved'].includes(incident.status)))
const sensors = computed(() => demo.scopedItems('sensors', user.value))
const metricCards = computed(() => [
  { key: 'healthScore', label: 'Health score', value: `${summary.value.healthScore}%`, detail: 'Weighted operational readiness', icon: 'pi-heart', tone: summary.value.healthScore >= 75 ? 'success' : summary.value.healthScore >= 55 ? 'warning' : 'danger' },
  { key: 'telemetryScore', label: 'Telemetry coverage', value: `${summary.value.telemetryScore}%`, detail: `${summary.value.activeSensors}/${summary.value.totalSensors} online sensors`, icon: 'pi-wifi', tone: 'success' },
  { key: 'complianceScore', label: 'Compliance score', value: `${summary.value.complianceScore}%`, detail: 'Assets meeting current rules', icon: 'pi-check-circle', tone: summary.value.complianceScore >= 75 ? 'success' : 'danger' },
  { key: 'activeAlerts', label: 'Open alerts', value: summary.value.activeAlerts, detail: 'Active or acknowledged events', icon: 'pi-bell', tone: summary.value.activeAlerts ? 'warning' : 'success' },
  { key: 'openIncidents', label: 'Open incidents', value: summary.value.openIncidents, detail: 'Cases requiring follow-up', icon: 'pi-exclamation-triangle', tone: summary.value.openIncidents ? 'danger' : 'success' },
  { key: 'reportsReady', label: 'Reports ready', value: summary.value.reportsReady, detail: 'Generated exports', icon: 'pi-file', tone: 'success' }
])
const activeMetric = computed(() => metricCards.value.find((item) => item.key === selectedMetric.value) || metricCards.value[0])
const trendValues = computed(() => [summary.value.healthScore - 12, summary.value.healthScore - 4, summary.value.healthScore + 2, summary.value.healthScore - 8, summary.value.healthScore])
const trendPoints = computed(() => trendValues.value.map((v, i) => `${10 + i * 45},${85 - Math.max(5, Math.min(90, v))}`).join(' '))

function toggleWidget(widget) {
  visibleWidgets.value = visibleWidgets.value.includes(widget)
    ? visibleWidgets.value.filter((item) => item !== widget)
    : [...visibleWidgets.value, widget]
}
function exportDashboard(){
  const record=demo.generateReport('Operational','Dashboard snapshot')
  downloadCsv('safelab-dashboard',[{organization:user.value?.organization||'SafeLab',...summary.value}])
}
const { openRecords } = useRecordNavigation()
</script>

<template>
  <section class="page">
    <div class="page-hero compact"><ContextPageHeading :description="$t('legacy.label_a8e7da5402')" /></div>

    <div class="filter-bar">
      <div class="field">
        <label>{{ $t('legacy.label_cd4d0c5e14') }}</label>
        <select v-model="demo.selectedFacilityId" class="select">
          <option value="all">{{ $t('legacy.label_afcf546a4c') }}</option>
          <option v-for="facility in facilities" :key="facility.id" :value="facility.id">{{ facility.name }}</option>
        </select>
      </div>
      <div class="field">
        <label>{{ $t('legacy.label_170a28a9db') }}</label>
        <select v-model="demo.selectedPeriod" class="select">
          <option value="24h">{{ $t('legacy.label_99d63362c1') }}</option>
          <option value="7d">{{ $t('legacy.label_df833fe88d') }}</option>
          <option value="30d">{{ $t('legacy.label_6b32985251') }}</option>
        </select>
      </div>
      <div class="field">
        <label>{{ $t('legacy.label_a4c2123287') }}</label>
        <select v-model="selectedMetric" class="select">
          <option v-for="metric in metricCards" :key="metric.key" :value="metric.key">{{ metric.label }}</option>
        </select>
      </div>
      <div class="actions">
        <RouterLink class="btn primary" to="/alertsincidents/active-alerts"><i class="pi pi-bell"></i> {{ $t('legacy.label_415a1cd2c5') }}</RouterLink>
        <button v-if="auth.hasPermission('reports.export')" class="btn" type="button" @click="exportDashboard"><i class="pi pi-download"></i> {{ $t('legacy.label_edd58b3ae7') }}</button>
      </div>
    </div>

    <div class="kpi-grid">
      <button v-for="metric in metricCards" :key="metric.key" :class="['kpi-card', metric.tone]" type="button" @click="selectedMetric = metric.key">
        <span class="kpi-icon"><i :class="`pi ${metric.icon}`"></i></span>
        <span class="kpi-copy"><span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small>{{ metric.detail }}</small></span>
      </button>
    </div>

    <div class="grid-2">
      <article class="card">
        <div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_a8d483a2c0') }}</p><h2>{{ activeMetric.label }}</h2><p>{{ activeMetric.detail }}</p></div></div>
        <div class="ring-chart" :style="{ '--value': Number(String(activeMetric.value).replace('%','')) || summary.healthScore }"><strong>{{ activeMetric.value }}</strong></div>
        <svg class="sparkline" viewBox="0 0 200 100" aria-hidden="true"><polyline class="shadow" :points="trendPoints"/><polyline :points="trendPoints"/></svg>
      </article>

      <article class="card">
        <div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_7a9ec182f6') }}</p><h2>{{ $t('legacy.label_9749e138c8') }}</h2><p>{{ $t('legacy.label_e5cbaf66d5') }}</p></div></div>
        <div class="grid-3">
          <button v-for="widget in ['compliance','alerts','facilities','risks','trends','workflow']" :key="widget" :class="['btn', visibleWidgets.includes(widget) ? 'primary' : '']" type="button" @click="toggleWidget(widget)">{{ widget }}</button>
        </div>
      </article>
    </div>

    <div class="grid-2" v-if="visibleWidgets.includes('compliance') || visibleWidgets.includes('alerts')">
      <article v-if="visibleWidgets.includes('compliance')" class="record-summary-card card" role="link" tabindex="0" aria-label="complianceRules" @click="openRecords('dashboardinsights','complianceRules',$event)" @keydown.enter.self.prevent="openRecords('dashboardinsights','complianceRules')" @keydown.space.self.prevent="openRecords('dashboardinsights','complianceRules')">
        <div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_1911601a10') }}</p><h2>{{ $t('legacy.label_387b13c80e') }}</h2></div><span :class="['status-pill', summary.complianceScore >= 75 ? 'success' : 'danger']">{{ summary.complianceScore >= 75 ? 'Compliant' : 'Needs action' }}</span></div>
        <div class="ring-chart" :style="{ '--value': summary.complianceScore }"><strong>{{ summary.complianceScore }}%</strong></div>
        <div class="progress"><i :style="{ width: `${summary.complianceScore}%` }"></i></div>
        <div class="pair-grid" style="margin-top: 14px;"><div class="pair-box"><span>{{ $t('legacy.label_08df4b684f') }}</span><strong>{{ summary.criticalAlerts }}</strong></div><div class="pair-box"><span>{{ $t('legacy.label_4ba655f177') }}</span><strong>{{ summary.pendingEvidence }}</strong></div></div>
      </article>

      <article v-if="visibleWidgets.includes('alerts')" class="record-summary-card card" role="link" tabindex="0" aria-label="alerts" @click="openRecords('dashboardinsights','alerts',$event)" @keydown.enter.self.prevent="openRecords('dashboardinsights','alerts')" @keydown.space.self.prevent="openRecords('dashboardinsights','alerts')">
        <div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_72d5617f3f') }}</p><h2>{{ $t('legacy.label_fa94074b35') }}</h2></div><RouterLink class="btn small primary" to="/alertsincidents/active-alerts">{{ $t('legacy.label_bd26e766cc') }}</RouterLink></div>
        <div class="item-list">
          <article v-for="alert in alerts.slice(0, 5)" :key="alert.id" class="list-row compact">
            <span><strong>{{ alert.title }}</strong><small>{{ alert.message }}</small></span>
            <LocalizedStatusBadge :status="alert.severity"/>
            <button class="btn small" type="button" @click="demo.acknowledgeAlert(alert.id)">{{ $t('legacy.label_f0f2836bef') }}</button>
          </article>
        </div>
      </article>
    </div>

    <div class="grid-2" v-if="visibleWidgets.includes('facilities') || visibleWidgets.includes('risks')">
      <article v-if="visibleWidgets.includes('facilities')" class="record-summary-card card" role="link" tabindex="0" aria-label="facilities" @click="openRecords('dashboardinsights','facilities',$event)" @keydown.enter.self.prevent="openRecords('dashboardinsights','facilities')" @keydown.space.self.prevent="openRecords('dashboardinsights','facilities')">
        <div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_904a9bb755') }}</p><h2>{{ $t('legacy.label_f92806ee3e') }}</h2></div></div>
        <div class="item-list">
          <button v-for="facility in facilities" :key="facility.id" class="list-row compact" type="button" @click="demo.setFacility(facility.id)">
            <span><strong>{{ facility.name }}</strong><small>{{ facility.type }} · {{ facility.city }}</small></span>
            <span :class="['status-pill', facility.healthScore >= 75 ? 'success' : 'danger']">{{ facility.healthScore }}%</span>
            <i class="pi pi-angle-right"></i>
          </button>
        </div>
      </article>

      <article v-if="visibleWidgets.includes('risks')" class="record-summary-card card" role="link" tabindex="0" aria-label="sensors" @click="openRecords('dashboardinsights','sensors',$event)" @keydown.enter.self.prevent="openRecords('dashboardinsights','sensors')" @keydown.space.self.prevent="openRecords('dashboardinsights','sensors')">
        <div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_c85ec33877') }}</p><h2>{{ $t('legacy.label_af096258bd') }}</h2></div></div>
        <div class="pair-grid">
          <div class="pair-box"><span>{{ $t('legacy.label_c9506f98b1') }}</span><strong>{{ summary.abnormalSensors }}</strong></div>
          <div class="pair-box"><span>{{ $t('legacy.label_7bb618dece') }}</span><strong>{{ summary.disconnectedSensors }}</strong></div>
          <div class="pair-box"><span>{{ $t('legacy.label_77d7229dcd') }}</span><strong>{{ summary.openIncidents }}</strong></div>
          <div class="pair-box"><span>{{ $t('legacy.label_2a8ca49161') }}</span><strong>{{ summary.reportsReady }}</strong></div>
        </div>
      </article>
    </div>

    <article v-if="visibleWidgets.includes('workflow')" class="record-summary-card card" role="link" tabindex="0" aria-label="auditLogs" @click="openRecords('dashboardinsights','auditLogs',$event)" @keydown.enter.self.prevent="openRecords('dashboardinsights','auditLogs')" @keydown.space.self.prevent="openRecords('dashboardinsights','auditLogs')">
      <div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_fed99524db') }}</p><h2>{{ $t('legacy.label_9760355aa9') }}</h2><p>{{ $t('legacy.label_c796be609b') }}</p></div></div>
      <div class="grid-4">
        <div class="pair-box"><span>{{ $t('legacy.label_e76b485554') }}</span><strong>{{ sensors.length }} records</strong></div>
        <div class="pair-box"><span>{{ $t('legacy.label_b1ca799a33') }}</span><strong>{{ alerts.length }} events</strong></div>
        <div class="pair-box"><span>{{ $t('legacy.label_f1fe91c50d') }}</span><strong>{{ incidents.length }} cases</strong></div>
        <div class="pair-box"><span>{{ $t('legacy.label_cc9fd8a49b') }}</span><strong>{{ demo.auditLogs.length }} logs</strong></div>
      </div>
    </article>
  </section>
</template>
