<script setup>
import ContextPageHeading from '@/shared/presentation/components/ContextPageHeading.vue'
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/boundedcontext/identityaccess/application/stores/auth.store'
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
    <div class="page-hero compact"><ContextPageHeading :description="$t('legacy.label_3d8c84643f')" /></div>
    <div class="records-quick-actions"><RouterLink class="btn records-view-button" to="/facilityassets/records/assets"><i class="pi pi-list"></i> {{ $t('records.viewAll') }}</RouterLink></div>
<div class="page-toolbar"><button class="btn success" type="button" @click="openNew"><i class="pi pi-plus"></i> {{ $t('legacy.label_002f1230d6') }}</button></div>
    <div class="kpi-grid">
      <article class="kpi-card"><span class="kpi-icon"><i class="pi pi-box"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_b82abdb339') }}</span><strong>{{ summary.total }}</strong><small>{{ $t('legacy.label_ee8b977071') }}</small></div></article>
      <article class="kpi-card success"><span class="kpi-icon"><i class="pi pi-check"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_c584a3644f') }}</span><strong>{{ summary.compliant }}</strong><small>{{ $t('legacy.label_9aa4808dd4') }}</small></div></article>
      <article class="kpi-card warning"><span class="kpi-icon"><i class="pi pi-exclamation-circle"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_e9c4556335') }}</span><strong>{{ summary.warning }}</strong><small>{{ $t('legacy.label_6e641e5ec9') }}</small></div></article>
      <article class="kpi-card danger"><span class="kpi-icon"><i class="pi pi-times-circle"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_04b7b26c8c') }}</span><strong>{{ summary.critical }}</strong><small>{{ $t('legacy.label_d500c878e4') }}</small></div></article>
    </div>
    <div class="filter-bar">
      <div class="field"><label>{{ $t('legacy.label_bce0641417') }}</label><input v-model="search" class="input" placeholder="Asset, location or responsible" /></div>
      <div class="field"><label>{{ $t('legacy.label_bae7d5be70') }}</label><select v-model="statusFilter" class="select"><option value="all">{{ $t('legacy.label_6405179d24') }}</option><option value="compliant">{{ $t('legacy.label_c584a3644f') }}</option><option value="warning">{{ $t('legacy.label_e9c4556335') }}</option><option value="critical">{{ $t('legacy.label_04b7b26c8c') }}</option></select></div>
      <div class="actions"><button class="btn" @click="search='';statusFilter='all'">{{ $t('legacy.label_412226715c') }}</button></div>
    </div>
    <article class="card table-card">
      <div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_c9869c9ded') }}</p><h2>{{ $t('legacy.label_dbf3cbe816') }}</h2><p>{{ $t('legacy.label_62439e6291') }}</p></div></div>
      <table class="responsive-table">
        <thead><tr><th>{{ $t('legacy.label_4426afd90a') }}</th><th>{{ $t('legacy.label_9e092dda4f') }}</th><th>{{ $t('legacy.label_d219c68101') }}</th><th>{{ $t('legacy.label_96cd625f32') }}</th><th>{{ $t('legacy.label_bae7d5be70') }}</th><th>{{ $t('legacy.label_c3cd636a58') }}</th></tr></thead>
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
        <header class="modal-header"><div><p class="eyebrow">{{ $t('legacy.label_334d8e7027') }}</p><h2>{{ form.id ? 'Edit asset' : 'New asset' }}</h2></div><button class="icon-action" @click="modalOpen=false"><i class="pi pi-times"></i></button></header>
        <form class="modal-form" @submit.prevent="save">
          <div class="field"><label>{{ $t('legacy.label_8b160a9317') }}</label><input v-model="form.name" required class="input" /></div>
          <div class="field"><label>{{ $t('legacy.label_a3c686e711') }}</label><input v-model="form.category" required class="input" /></div>
          <div class="field"><label>{{ $t('legacy.label_cd4d0c5e14') }}</label><select v-model="form.facilityId" class="select"><option v-for="facility in facilities" :key="facility.id" :value="facility.id">{{ facility.name }}</option></select></div>
          <div class="field"><label>{{ $t('legacy.label_3467b79a6d') }}</label><input v-model="form.storageUnit" class="input" /></div>
          <div class="field full"><label>{{ $t('legacy.label_d219c68101') }}</label><input v-model="form.location" class="input" /></div>
          <div class="field"><label>{{ $t('legacy.label_d0a0958f60') }}</label><input v-model="form.lastInspection" type="date" class="input" /></div>
          <div class="field"><label>{{ $t('legacy.label_96cd625f32') }}</label><input v-model="form.responsible" class="input" /></div>
          <div class="field"><label>{{ $t('legacy.label_bae7d5be70') }}</label><select v-model="form.status" class="select"><option value="compliant">{{ $t('legacy.label_c584a3644f') }}</option><option value="warning">{{ $t('legacy.label_e9c4556335') }}</option><option value="critical">{{ $t('legacy.label_04b7b26c8c') }}</option></select></div>
          <footer class="modal-footer full"><button type="button" class="btn" @click="modalOpen=false">{{ $t('legacy.label_77dfd2135f') }}</button><button class="btn success" type="submit"><i class="pi pi-check"></i> {{ $t('legacy.label_efc007a393') }}</button></footer>
        </form>
      </article>
    </div>
  </section>
</template>
