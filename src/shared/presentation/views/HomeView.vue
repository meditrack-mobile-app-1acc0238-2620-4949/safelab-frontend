<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/identity-access/application/stores/auth.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
import { boundedContextNavigation } from '@/shared/domain/model/navigation-items'

const router = useRouter()
const auth = useAuthStore()
const demo = useSafeLabDemoStore()
auth.restoreSession()

const user = computed(() => auth.currentUser)
const summary = computed(() => demo.dashboardSummary(user.value))
const visibleModules = computed(() => boundedContextNavigation.filter((item) => auth.canAccessContext(item.context)))
const recentAlerts = computed(() => demo.scopedItems('alerts', user.value).filter((alert) => alert.status !== 'resolved').slice(0, 4))
const incidents = computed(() => demo.scopedItems('incidents', user.value).filter((incident) => !['closed', 'resolved'].includes(incident.status)).slice(0, 3))

</script>

<template>
  <section class="page">
    <div class="page-hero">
      <div>
        <p class="eyebrow">SafeLab home</p>
        <h1>Operational workspace</h1>
        <p>
          Role-aware summary for {{ user?.position || 'SafeLab user' }}. This page connects the main bounded contexts and shows what requires attention today based on the current data state.
        </p>
        <div class="actions">
          <RouterLink class="btn" to="/dashboard-overview/laboratory-dashboard">
            Open dashboard
          </RouterLink>
        </div>
      </div>
      <div class="hero-score">
        <span>Operational health</span>
        <strong>{{ summary.healthScore }}%</strong>
        <small>{{ summary.activeAlerts }} active alerts · {{ summary.openIncidents }} open incidents</small>
      </div>
    </div>

    <div class="kpi-grid">
      <article class="kpi-card success">
        <span class="kpi-icon"><i class="pi pi-wifi"></i></span>
        <div class="kpi-copy"><span>Online sensors</span><strong>{{ summary.activeSensors }}/{{ summary.totalSensors }}</strong><small>Telemetry coverage</small></div>
      </article>
      <article class="kpi-card">
        <span class="kpi-icon"><i class="pi pi-box"></i></span>
        <div class="kpi-copy"><span>Assets</span><strong>{{ summary.storageUnits }}</strong><small>Storage and equipment</small></div>
      </article>
      <article class="kpi-card warning">
        <span class="kpi-icon"><i class="pi pi-bell"></i></span>
        <div class="kpi-copy"><span>Open alerts</span><strong>{{ summary.activeAlerts }}</strong><small>Need review</small></div>
      </article>
      <article class="kpi-card danger">
        <span class="kpi-icon"><i class="pi pi-exclamation-triangle"></i></span>
        <div class="kpi-copy"><span>Open incidents</span><strong>{{ summary.openIncidents }}</strong><small>Operational cases</small></div>
      </article>
    </div>

    <div class="grid-2">
      <article class="card">
        <div class="card-header">
          <div class="card-title">
            <p class="eyebrow">Module summary</p>
            <h2>Available bounded contexts</h2>
            <p>Only modules allowed by the active role are shown.</p>
          </div>
        </div>
        <div class="module-card-grid">
          <RouterLink v-for="item in visibleModules" :key="item.context" :to="item.path" class="module-card">
            <i :class="`pi pi-${item.icon}`"></i>
            <strong>{{ item.shortLabel || item.titleKey }}</strong>
            <small class="text-muted">{{ item.roleScope }}</small>
          </RouterLink>
        </div>
      </article>

      <article class="card">
        <div class="card-header">
          <div class="card-title">
            <p class="eyebrow">Action feed</p>
            <h2>Alerts and incidents</h2>
            <p>New events generated from sensors, remote commands and compliance actions appear here.</p>
          </div>
        </div>
        <div class="item-list">
          <button v-for="alert in recentAlerts" :key="alert.id" class="list-row" type="button" @click="router.push('/alerts-notifications/active-alerts')">
            <span><strong>{{ alert.title }}</strong><small>{{ alert.message }}</small></span>
            <span :class="['status-pill', alert.severity]">{{ alert.severity }}</span>
          </button>
          <button v-for="incident in incidents" :key="incident.id" class="list-row" type="button" @click="router.push(`/incident-management/incident-detail/${incident.id}`)">
            <span><strong>{{ incident.code }} · {{ incident.title }}</strong><small>{{ incident.description }}</small></span>
            <span :class="['status-pill', incident.status]">{{ incident.status }}</span>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
