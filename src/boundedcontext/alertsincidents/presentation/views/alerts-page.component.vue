<script setup>
import ContextPageHeading from '@/shared/presentation/components/ContextPageHeading.vue'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/boundedcontext/identityaccess/application/stores/auth.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
const auth = useAuthStore(); const demo = useSafeLabDemoStore(); auth.restoreSession()
const search = ref(''); const severity = ref('all'); const status = ref('all'); const selectedAlert = ref(null)
const user = computed(() => auth.currentUser)
const alerts = computed(() => demo.scopedItems('alerts', user.value).filter((alert) => {
  const text = `${alert.title} ${alert.message} ${alert.type} ${alert.assignedTo}`.toLowerCase()
  return text.includes(search.value.toLowerCase()) && (severity.value === 'all' || alert.severity === severity.value) && (status.value === 'all' || alert.status === status.value)
}))
const summary = computed(() => ({
  critical: alerts.value.filter((a)=>a.severity==='critical' && a.status !== 'resolved').length,
  unack: alerts.value.filter((a)=>a.status==='active').length,
  total: alerts.value.length,
  resolved: alerts.value.filter((a)=>a.status==='resolved').length
}))
function open(alert){ selectedAlert.value = alert }
function ack(){ demo.acknowledgeAlert(selectedAlert.value.id); selectedAlert.value = demo.alerts.find(a=>a.id===selectedAlert.value.id) }
function resolve(){ demo.resolveAlert(selectedAlert.value.id); selectedAlert.value = demo.alerts.find(a=>a.id===selectedAlert.value.id) }
function escalate(){ demo.escalateAlert(selectedAlert.value.id); selectedAlert.value = demo.alerts.find(a=>a.id===selectedAlert.value.id) }
</script>
<template>
  <section class="page">
    <div class="page-hero compact"><ContextPageHeading :description="$t('legacy.label_ee20826c91')" /></div>
    <div class="records-quick-actions"><RouterLink class="btn records-view-button" to="/alertsincidents/records/alerts"><i class="pi pi-list"></i> {{ $t('records.viewAll') }}</RouterLink></div>
    <div class="kpi-grid"><article class="kpi-card danger"><span class="kpi-icon"><i class="pi pi-exclamation-triangle"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_08df4b684f') }}</span><strong>{{ summary.critical }}</strong><small>{{ $t('legacy.label_d500c878e4') }}</small></div></article><article class="kpi-card warning"><span class="kpi-icon"><i class="pi pi-bell"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_d15288da43') }}</span><strong>{{ summary.unack }}</strong><small>{{ $t('legacy.label_6a80f44e3b') }}</small></div></article><article class="kpi-card"><span class="kpi-icon"><i class="pi pi-list"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_fde0ecac2d') }}</span><strong>{{ summary.total }}</strong><small>{{ $t('legacy.label_bb04d85bc4') }}</small></div></article><article class="kpi-card success"><span class="kpi-icon"><i class="pi pi-check"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_d999aeb054') }}</span><strong>{{ summary.resolved }}</strong><small>{{ $t('legacy.label_61ac187a7b') }}</small></div></article></div>
    <div class="filter-bar"><div class="field"><label>{{ $t('legacy.label_bce0641417') }}</label><input v-model="search" class="input" placeholder="Device, location, type..."></div><div class="field"><label>{{ $t('legacy.label_de314fa0c9') }}</label><select v-model="severity" class="select"><option value="all">{{ $t('legacy.label_068616a640') }}</option><option value="critical">{{ $t('legacy.label_04b7b26c8c') }}</option><option value="warning">{{ $t('legacy.label_e9c4556335') }}</option><option value="info">{{ $t('legacy.label_4b631f6984') }}</option></select></div><div class="field"><label>{{ $t('legacy.label_bae7d5be70') }}</label><select v-model="status" class="select"><option value="all">{{ $t('legacy.label_6405179d24') }}</option><option value="active">{{ $t('legacy.label_a733b809d2') }}</option><option value="acknowledged">{{ $t('legacy.label_9415af18fe') }}</option><option value="escalated">{{ $t('legacy.label_aff666f44e') }}</option><option value="resolved">{{ $t('legacy.label_d999aeb054') }}</option></select></div><div class="actions"><button class="btn" @click="search='';severity='all';status='all'">{{ $t('legacy.label_412226715c') }}</button></div></div>
    <article class="card table-card"><table class="responsive-table"><thead><tr><th>{{ $t('legacy.label_b969680a49') }}</th><th>{{ $t('legacy.label_4651a34e4d') }}</th><th>{{ $t('legacy.label_de314fa0c9') }}</th><th>{{ $t('legacy.label_bae7d5be70') }}</th><th>{{ $t('legacy.label_accf40c89b') }}</th><th>{{ $t('legacy.label_c3cd636a58') }}</th></tr></thead><tbody><tr v-for="alert in alerts" :key="alert.id"><td data-label="Alert"><strong>{{ alert.title }}</strong><br><small>{{ alert.message }}</small></td><td data-label="Scope">{{ alert.assignedTo }}<br><small>{{ alert.type }}</small></td><td data-label="Severity"><span :class="['status-pill', alert.severity]">{{ alert.severity }}</span></td><td data-label="Status"><span :class="['status-pill', alert.status]">{{ alert.status }}</span></td><td data-label="Created">{{ new Date(alert.createdAt).toLocaleString() }}</td><td data-label="Actions"><button class="btn small primary" @click="open(alert)">{{ $t('legacy.label_dc3decbb93') }}</button></td></tr></tbody></table></article>
    <div v-if="selectedAlert" class="modal-backdrop" @click.self="selectedAlert=null"><article class="modal-card medium"><header class="modal-header"><div><p class="eyebrow">{{ $t('legacy.label_9da05ba303') }}</p><h2>{{ selectedAlert.title }}</h2><p>{{ selectedAlert.message }}</p></div><button class="icon-action" @click="selectedAlert=null"><i class="pi pi-times"></i></button></header><div class="pair-grid"><div class="pair-box"><span>{{ $t('legacy.label_3deb745651') }}</span><strong>{{ selectedAlert.type }}</strong></div><div class="pair-box"><span>{{ $t('legacy.label_bb2279f04d') }}</span><strong>{{ selectedAlert.assignedTo }}</strong></div><div class="pair-box"><span>{{ $t('legacy.label_de314fa0c9') }}</span><strong>{{ selectedAlert.severity }}</strong></div><div class="pair-box"><span>{{ $t('legacy.label_bae7d5be70') }}</span><strong>{{ selectedAlert.status }}</strong></div></div><footer class="modal-footer"><button class="btn" @click="ack">{{ $t('legacy.label_9beb96dac8') }}</button><button class="btn success" @click="resolve">{{ $t('legacy.label_ac7f958cc0') }}</button><button class="btn danger" @click="escalate">{{ $t('legacy.label_012bb11a52') }}</button></footer></article></div>
  </section>
</template>
