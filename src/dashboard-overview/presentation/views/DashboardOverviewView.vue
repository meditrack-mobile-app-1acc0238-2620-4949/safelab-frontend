<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/identity-access/application/stores/auth.store'
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
</script>

<template>
  <section class="page">
    <div class="page-hero compact">
      <div>
        <p class="eyebrow">Dashboard & overview</p>
        <h1>Operational dashboard</h1>
        <p>Filter, compare and inspect the operational health of laboratories, sensors, alerts, incidents and compliance readiness.</p>
      </div>
      <div class="hero-score"><span>Health score</span><strong>{{ summary.healthScore }}%</strong><small>{{ user?.position || 'Role-aware scope' }}</small></div>
    </div>

    <div class="filter-bar">
      <div class="field">
        <label>Facility</label>
        <select v-model="demo.selectedFacilityId" class="select">
          <option value="all">All allowed facilities</option>
          <option v-for="facility in facilities" :key="facility.id" :value="facility.id">{{ facility.name }}</option>
        </select>
      </div>
      <div class="field">
        <label>Period</label>
        <select v-model="demo.selectedPeriod" class="select">
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
      <div class="field">
        <label>Selected metric</label>
        <select v-model="selectedMetric" class="select">
          <option v-for="metric in metricCards" :key="metric.key" :value="metric.key">{{ metric.label }}</option>
        </select>
      </div>
      <div class="actions">
        <RouterLink class="btn primary" to="/alerts-notifications/active-alerts"><i class="pi pi-bell"></i> Review alerts</RouterLink>
        <button class="btn" type="button" @click="demo.generateReport('Operational', 'Dashboard snapshot')"><i class="pi pi-download"></i> Export snapshot</button>
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
        <div class="card-header"><div><p class="eyebrow">Metric explorer</p><h2>{{ activeMetric.label }}</h2><p>{{ activeMetric.detail }}</p></div></div>
        <div class="ring-chart" :style="{ '--value': Number(String(activeMetric.value).replace('%','')) || summary.healthScore }"><strong>{{ activeMetric.value }}</strong></div>
        <svg class="sparkline" viewBox="0 0 200 100" aria-hidden="true"><polyline class="shadow" :points="trendPoints"/><polyline :points="trendPoints"/></svg>
      </article>

      <article class="card">
        <div class="card-header"><div><p class="eyebrow">Widget studio</p><h2>Visible sections</h2><p>Turn dashboard widgets on/off without changing data.</p></div></div>
        <div class="grid-3">
          <button v-for="widget in ['compliance','alerts','facilities','risks','trends','workflow']" :key="widget" :class="['btn', visibleWidgets.includes(widget) ? 'primary' : '']" type="button" @click="toggleWidget(widget)">{{ widget }}</button>
        </div>
      </article>
    </div>

    <div class="grid-2" v-if="visibleWidgets.includes('compliance') || visibleWidgets.includes('alerts')">
      <article v-if="visibleWidgets.includes('compliance')" class="card">
        <div class="card-header"><div><p class="eyebrow">Compliance control</p><h2>Storage compliance</h2></div><span :class="['status-pill', summary.complianceScore >= 75 ? 'success' : 'danger']">{{ summary.complianceScore >= 75 ? 'Compliant' : 'Needs action' }}</span></div>
        <div class="ring-chart" :style="{ '--value': summary.complianceScore }"><strong>{{ summary.complianceScore }}%</strong></div>
        <div class="progress"><i :style="{ width: `${summary.complianceScore}%` }"></i></div>
        <div class="pair-grid" style="margin-top: 14px;"><div class="pair-box"><span>Critical alerts</span><strong>{{ summary.criticalAlerts }}</strong></div><div class="pair-box"><span>Pending evidence</span><strong>{{ summary.pendingEvidence }}</strong></div></div>
      </article>

      <article v-if="visibleWidgets.includes('alerts')" class="card">
        <div class="card-header"><div><p class="eyebrow">Recent activity</p><h2>Priority alerts</h2></div><RouterLink class="btn small primary" to="/alerts-notifications/active-alerts">View alerts</RouterLink></div>
        <div class="item-list">
          <article v-for="alert in alerts.slice(0, 5)" :key="alert.id" class="list-row compact">
            <span><strong>{{ alert.title }}</strong><small>{{ alert.message }}</small></span>
            <span :class="['status-pill', alert.severity]">{{ alert.severity }}</span>
            <button class="btn small" type="button" @click="demo.acknowledgeAlert(alert.id)">Ack</button>
          </article>
        </div>
      </article>
    </div>

    <div class="grid-2" v-if="visibleWidgets.includes('facilities') || visibleWidgets.includes('risks')">
      <article v-if="visibleWidgets.includes('facilities')" class="card">
        <div class="card-header"><div><p class="eyebrow">Facility performance</p><h2>Monitored facilities</h2></div></div>
        <div class="item-list">
          <button v-for="facility in facilities" :key="facility.id" class="list-row compact" type="button" @click="demo.setFacility(facility.id)">
            <span><strong>{{ facility.name }}</strong><small>{{ facility.type }} · {{ facility.city }}</small></span>
            <span :class="['status-pill', facility.healthScore >= 75 ? 'success' : 'danger']">{{ facility.healthScore }}%</span>
            <i class="pi pi-angle-right"></i>
          </button>
        </div>
      </article>

      <article v-if="visibleWidgets.includes('risks')" class="card">
        <div class="card-header"><div><p class="eyebrow">Operational risks</p><h2>Risk snapshot</h2></div></div>
        <div class="pair-grid">
          <div class="pair-box"><span>Sensor deviations</span><strong>{{ summary.abnormalSensors }}</strong></div>
          <div class="pair-box"><span>Disconnected sensors</span><strong>{{ summary.disconnectedSensors }}</strong></div>
          <div class="pair-box"><span>Open incidents</span><strong>{{ summary.openIncidents }}</strong></div>
          <div class="pair-box"><span>Reports ready</span><strong>{{ summary.reportsReady }}</strong></div>
        </div>
      </article>
    </div>

    <article v-if="visibleWidgets.includes('workflow')" class="card">
      <div class="card-header"><div><p class="eyebrow">Cross-context workflow</p><h2>How modules interact</h2><p>Operational chain generated from the shared SafeLab data model.</p></div></div>
      <div class="grid-4">
        <div class="pair-box"><span>1. Sensor event</span><strong>{{ sensors.length }} records</strong></div>
        <div class="pair-box"><span>2. Alert generated</span><strong>{{ alerts.length }} events</strong></div>
        <div class="pair-box"><span>3. Incident opened</span><strong>{{ incidents.length }} cases</strong></div>
        <div class="pair-box"><span>4. Audit persisted</span><strong>{{ demo.auditLogs.length }} logs</strong></div>
      </div>
    </article>
  </section>
</template>
