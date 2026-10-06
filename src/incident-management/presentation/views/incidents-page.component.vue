<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/identity-access/application/stores/auth.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
const router = useRouter(); const auth = useAuthStore(); const demo = useSafeLabDemoStore(); auth.restoreSession()
const search = ref(''); const status = ref('all'); const severity = ref('all')
const user = computed(() => auth.currentUser)
const incidents = computed(() => demo.scopedItems('incidents', user.value).filter((incident) => {
  const text = `${incident.code} ${incident.title} ${incident.description} ${incident.assignedTo}`.toLowerCase()
  return text.includes(search.value.toLowerCase()) && (status.value === 'all' || incident.status === status.value) && (severity.value === 'all' || incident.severity === severity.value)
}))
const summary = computed(() => ({ total: incidents.value.length, open: incidents.value.filter(i=>i.status==='open').length, investigating: incidents.value.filter(i=>i.status==='investigating').length, critical: incidents.value.filter(i=>i.severity==='critical').length }))
</script>
<template>
  <section class="page">
    <div class="page-hero compact"><div><p class="eyebrow">Operations</p><h1>Incident management</h1><p>Track, investigate, resolve and document incidents generated from alerts, compliance deviations and asset events.</p></div><button class="btn warning" @click="demo.escalateAlert(demo.alerts.find(a=>a.status!=='resolved')?.id)">Create from alert</button></div>
    <div class="kpi-grid"><article class="kpi-card"><span class="kpi-icon"><i class="pi pi-list"></i></span><div class="kpi-copy"><span>Total incidents</span><strong>{{ summary.total }}</strong><small>Registered cases</small></div></article><article class="kpi-card warning"><span class="kpi-icon"><i class="pi pi-clock"></i></span><div class="kpi-copy"><span>Open</span><strong>{{ summary.open }}</strong><small>Waiting for action</small></div></article><article class="kpi-card"><span class="kpi-icon"><i class="pi pi-search"></i></span><div class="kpi-copy"><span>Investigating</span><strong>{{ summary.investigating }}</strong><small>Under review</small></div></article><article class="kpi-card danger"><span class="kpi-icon"><i class="pi pi-exclamation-triangle"></i></span><div class="kpi-copy"><span>Critical</span><strong>{{ summary.critical }}</strong><small>High priority</small></div></article></div>
    <div class="filter-bar"><div class="field"><label>Search</label><input v-model="search" class="input" placeholder="Title, sensor, area or code"></div><div class="field"><label>Status</label><select v-model="status" class="select"><option value="all">All</option><option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div><div class="field"><label>Severity</label><select v-model="severity" class="select"><option value="all">All</option><option value="critical">Critical</option><option value="warning">Warning</option><option value="info">Info</option></select></div></div>
    <div class="incident-grid"><article v-for="incident in incidents" :key="incident.id" :class="['incident-card', incident.severity]"><div class="card-header"><div><p class="eyebrow">{{ incident.code }} · {{ incident.severity }}</p><h3>{{ incident.title }}</h3><p>{{ incident.description }}</p></div><span :class="['status-pill', incident.status]">{{ incident.status }}</span></div><div class="pair-grid"><div class="pair-box"><span>Assigned to</span><strong>{{ incident.assignedTo }}</strong></div><div class="pair-box"><span>Due date</span><strong>{{ incident.dueDate }}</strong></div><div class="pair-box"><span>Evidence</span><strong>{{ incident.evidence }}</strong></div><div class="pair-box"><span>Sensor</span><strong>{{ incident.relatedSensorId }}</strong></div></div><div class="actions"><button class="btn small primary" @click="router.push(`/incident-management/incident-detail/${incident.id}`)">View details</button><button class="btn small success" @click="demo.updateIncidentStatus(incident.id,'resolved')">Resolve</button></div></article></div>
  </section>
</template>
