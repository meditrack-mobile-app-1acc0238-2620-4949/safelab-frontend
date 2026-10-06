<script setup>
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/identity-access/application/stores/auth.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'

const auth = useAuthStore(); const demo = useSafeLabDemoStore(); auth.restoreSession()
const search = ref(''); const statusFilter = ref('all'); const modalOpen = ref(false)
const form = reactive({})
const user = computed(() => auth.currentUser)
const assets = computed(() => demo.scopedItems('assets', user.value).filter((asset) => {
  const text = `${asset.name} ${asset.category} ${asset.location} ${asset.responsible}`.toLowerCase()
  return text.includes(search.value.toLowerCase()) && (statusFilter.value === 'all' || asset.status === statusFilter.value)
}))
const summary = computed(() => ({
  total: assets.value.length,
  compliant: assets.value.filter((a) => a.status === 'compliant').length,
  warning: assets.value.filter((a) => a.status === 'warning').length,
  critical: assets.value.filter((a) => a.status === 'critical').length
}))
const facilities = computed(() => demo.scopedFacilities(user.value))
function resetForm(asset = {}) { Object.assign(form, { id: '', name: '', category: 'Cold Storage', facilityId: facilities.value[0]?.id || 'fac-central', storageUnit: '', location: '', lastInspection: new Date().toISOString().slice(0,10), responsible: user.value?.fullName || 'Responsible user', status: 'compliant', scope: user.value?.segment || 'clinical-laboratory' }, asset) }
function openNew() { resetForm(); modalOpen.value = true }
function openEdit(asset) { resetForm(asset); modalOpen.value = true }
function save() { demo.saveAsset({ ...form }); modalOpen.value = false }
</script>

<template>
  <section class="page">
    <div class="page-hero compact">
      <div><p class="eyebrow">Asset & inventory monitoring</p><h1>Asset control center</h1><p>Register, edit, remove and audit monitored storage units and critical supplies.</p></div>
      <button class="btn success" type="button" @click="openNew"><i class="pi pi-plus"></i> New asset</button>
    </div>
    <div class="kpi-grid">
      <article class="kpi-card"><span class="kpi-icon"><i class="pi pi-box"></i></span><div class="kpi-copy"><span>Total assets</span><strong>{{ summary.total }}</strong><small>Registered inventory</small></div></article>
      <article class="kpi-card success"><span class="kpi-icon"><i class="pi pi-check"></i></span><div class="kpi-copy"><span>Compliant</span><strong>{{ summary.compliant }}</strong><small>Ready for operation</small></div></article>
      <article class="kpi-card warning"><span class="kpi-icon"><i class="pi pi-exclamation-circle"></i></span><div class="kpi-copy"><span>Warning</span><strong>{{ summary.warning }}</strong><small>Requires review</small></div></article>
      <article class="kpi-card danger"><span class="kpi-icon"><i class="pi pi-times-circle"></i></span><div class="kpi-copy"><span>Critical</span><strong>{{ summary.critical }}</strong><small>Immediate action</small></div></article>
    </div>
    <div class="filter-bar">
      <div class="field"><label>Search</label><input v-model="search" class="input" placeholder="Asset, location or responsible" /></div>
      <div class="field"><label>Status</label><select v-model="statusFilter" class="select"><option value="all">All statuses</option><option value="compliant">Compliant</option><option value="warning">Warning</option><option value="critical">Critical</option></select></div>
      <div class="actions"><button class="btn" @click="search='';statusFilter='all'">Clear filters</button></div>
    </div>
    <article class="card table-card">
      <div class="card-header"><div><p class="eyebrow">Monitored assets</p><h2>Inventory table</h2><p>No horizontal scroll on desktop or mobile; details open in a modal.</p></div></div>
      <table class="responsive-table">
        <thead><tr><th>Asset</th><th>Storage</th><th>Location</th><th>Responsible</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="asset in assets" :key="asset.id">
            <td data-label="Asset"><strong>{{ asset.name }}</strong><br><small>{{ asset.category }}</small></td>
            <td data-label="Storage">{{ asset.storageUnit }}<br><small>{{ asset.lastInspection }}</small></td>
            <td data-label="Location">{{ asset.location }}</td>
            <td data-label="Responsible">{{ asset.responsible }}</td>
            <td data-label="Status"><span :class="['status-pill', asset.status]">{{ asset.status }}</span></td>
            <td data-label="Actions"><span class="table-actions"><button class="icon-action" @click="openEdit(asset)"><i class="pi pi-pencil"></i></button><button class="icon-action danger" @click="demo.deleteAsset(asset.id)"><i class="pi pi-trash"></i></button></span></td>
          </tr>
        </tbody>
      </table>
    </article>
    <div v-if="modalOpen" class="modal-backdrop" @click.self="modalOpen=false">
      <article class="modal-card">
        <header class="modal-header"><div><p class="eyebrow">Asset details</p><h2>{{ form.id ? 'Edit asset' : 'New asset' }}</h2></div><button class="icon-action" @click="modalOpen=false"><i class="pi pi-times"></i></button></header>
        <form class="modal-form" @submit.prevent="save">
          <div class="field"><label>Asset name</label><input v-model="form.name" required class="input" /></div>
          <div class="field"><label>Category</label><input v-model="form.category" required class="input" /></div>
          <div class="field"><label>Facility</label><select v-model="form.facilityId" class="select"><option v-for="facility in facilities" :key="facility.id" :value="facility.id">{{ facility.name }}</option></select></div>
          <div class="field"><label>Storage unit</label><input v-model="form.storageUnit" class="input" /></div>
          <div class="field full"><label>Location</label><input v-model="form.location" class="input" /></div>
          <div class="field"><label>Last inspection</label><input v-model="form.lastInspection" type="date" class="input" /></div>
          <div class="field"><label>Responsible</label><input v-model="form.responsible" class="input" /></div>
          <div class="field"><label>Status</label><select v-model="form.status" class="select"><option value="compliant">Compliant</option><option value="warning">Warning</option><option value="critical">Critical</option></select></div>
          <footer class="modal-footer full"><button type="button" class="btn" @click="modalOpen=false">Cancel</button><button class="btn success" type="submit"><i class="pi pi-check"></i> Save</button></footer>
        </form>
      </article>
    </div>
  </section>
</template>
