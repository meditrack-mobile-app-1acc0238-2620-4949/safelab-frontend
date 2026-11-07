<script setup>
import LocalizedStatusBadge from '@/shared/presentation/components/LocalizedStatusBadge.vue'
import ContextPageHeading from '@/shared/presentation/components/ContextPageHeading.vue'
import { useRecordNavigation } from '@/shared/presentation/composables/useRecordNavigation'
import { computed,ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
import { useAuthStore } from '@/boundedcontext/identityaccess/application/stores/auth.store'
const demo=useSafeLabDemoStore(),auth=useAuthStore(),{t}=useI18n()
const maintenanceRecords=computed(()=>demo.maintenanceRecords)
const query=ref(''),status=ref('all'),selectedId=ref(''),activeTab=ref('equipment')
const equipment=computed(()=>demo.assets.filter(a=>(status.value==='all'||a.status===status.value)&&[a.name,a.id,a.location].some(v=>String(v||'').toLowerCase().includes(query.value.toLowerCase()))))
const selected=computed(()=>demo.assets.find(a=>a.id===selectedId.value))
const relatedSensors=computed(()=>demo.sensors.filter(s=>s.assetId===selectedId.value))
const relatedMaintenance=computed(()=>maintenanceRecords.value.filter(m=>m.equipmentId===selectedId.value))
const pending=computed(()=>maintenanceRecords.value.filter(m=>m.status!=='Completed').length)
function openDetails(id){selectedId.value=id}
const { openRecords } = useRecordNavigation()
</script>
<template>
  <section class="page"><div class="page-hero compact"><ContextPageHeading :description="t('equipment.description')" /></div>
    <div class="grid-4">
      <article class="kpi-card">
        <span class="kpi-icon"><i class="pi pi-box" aria-hidden="true"></i></span>
        <div class="kpi-copy">
          <span>{{ t('equipment.registered') }}</span>
          <strong>{{ demo.assets.length }}</strong>
          <small>{{ t('equipment.registeredDescription') }}</small>
        </div>
      </article>
      <article class="kpi-card success">
        <span class="kpi-icon"><i class="pi pi-check-circle" aria-hidden="true"></i></span>
        <div class="kpi-copy">
          <span>{{ t('equipment.compliant') }}</span>
          <strong>{{ demo.assets.filter(a => a.status === 'compliant').length }}</strong>
          <small>{{ t('equipment.compliantDescription') }}</small>
        </div>
      </article>
      <article class="kpi-card warning">
        <span class="kpi-icon"><i class="pi pi-wrench" aria-hidden="true"></i></span>
        <div class="kpi-copy">
          <span>{{ t('equipment.pending') }}</span>
          <strong>{{ pending }}</strong>
          <small>{{ t('equipment.pendingDescription') }}</small>
        </div>
      </article>
      <article class="kpi-card">
        <span class="kpi-icon"><i class="pi pi-list" aria-hidden="true"></i></span>
        <div class="kpi-copy">
          <span>{{ t('equipment.records') }}</span>
          <strong>{{ maintenanceRecords.length }}</strong>
          <small>{{ t('equipment.recordsDescription') }}</small>
        </div>
      </article>
    </div>
    <div class="actions maintenance-tabs"><button v-for="tab in ['equipment','maintenance']" :key="tab" type="button" :class="['btn',activeTab===tab?'primary':'']" @click="activeTab=tab">{{t(`equipment.${tab}`)}}</button></div>
    <template v-if="activeTab==='equipment'"><div class="filter-bar equipment-filter"><div class="field"><label>{{t('equipment.search')}}</label><input v-model="query" class="input" :placeholder="t('equipment.searchHint')" /></div><div class="field"><label>{{t('equipment.status')}}</label><select v-model="status" class="select"><option value="all">{{t('equipment.all')}}</option><option value="compliant">{{t('equipment.compliant')}}</option><option value="warning">{{t('equipment.warning')}}</option><option value="critical">{{t('equipment.critical')}}</option></select></div></div><div class="asset-grid"><article v-for="asset in equipment" :key="asset.id" class="asset-card"><div class="card-header"><div><p class="eyebrow">{{asset.id}}</p><h3>{{asset.name}}</h3><p>{{asset.location}}</p></div><LocalizedStatusBadge :status="asset.status"/></div><div class="pair-grid"><div class="pair-box"><span>{{t('equipment.facility')}}</span><strong>{{demo.facilities.find(f=>f.id===asset.facilityId)?.name||asset.facilityId}}</strong></div><div class="pair-box"><span>{{t('equipment.sensors')}}</span><strong>{{demo.sensors.filter(s=>s.assetId===asset.id).length}}</strong></div></div><button class="btn small primary" type="button" @click="openDetails(asset.id)">{{t('equipment.details')}}</button></article></div></template>
    <article v-else class="record-summary-card card" role="link" tabindex="0" aria-label="maintenanceRecords" @click="openRecords('equipmentmaintenance','maintenanceRecords',$event)" @keydown.enter.self.prevent="openRecords('equipmentmaintenance','maintenanceRecords')" @keydown.space.self.prevent="openRecords('equipmentmaintenance','maintenanceRecords')"><div class="card-header"><div><p class="eyebrow">{{t('equipment.maintenance')}}</p><h2>{{t('equipment.history')}}</h2></div></div><div class="table-scroll"><table class="responsive-table"><thead><tr><th>ID</th><th>{{t('equipment.asset')}}</th><th>{{t('equipment.type')}}</th><th>{{t('equipment.date')}}</th><th>{{t('equipment.status')}}</th><th>{{t('equipment.responsible')}}</th></tr></thead><tbody><tr v-for="record in maintenanceRecords" :key="record.id"><td>{{record.id}}</td><td>{{demo.assets.find(a=>a.id===record.equipmentId)?.name||record.equipmentId}}</td><td>{{record.type}}</td><td>{{record.date}}</td><td><LocalizedStatusBadge :status="record.status"/></td><td>{{record.responsible}}</td></tr></tbody></table></div></article>
    <div v-if="selected" class="modal-backdrop" @click.self="selectedId=''"><article class="card modal-card medium" role="dialog" aria-modal="true" :aria-label="t('equipment.details')"><header class="modal-header"><div><p class="eyebrow">{{selected.id}}</p><h2>{{selected.name}}</h2></div><button class="icon-action" @click="selectedId=''" :aria-label="t('billing.close')"><i class="pi pi-times"></i></button></header><div class="pair-grid"><div class="pair-box"><span>{{t('equipment.status')}}</span><LocalizedStatusBadge :status="selected.status"/></div><div class="pair-box"><span>{{t('equipment.location')}}</span><strong>{{selected.location}}</strong></div><div class="pair-box"><span>{{t('equipment.sensors')}}</span><strong>{{relatedSensors.map(s=>s.name).join(', ')||'—'}}</strong></div><div class="pair-box"><span>{{t('equipment.lastInspection')}}</span><strong>{{selected.lastInspection||'—'}}</strong></div></div><h3>{{t('equipment.history')}}</h3><div class="item-list"><article v-for="record in relatedMaintenance" :key="record.id" class="list-row"><span><strong>{{record.id}} · {{record.type}}</strong><small>{{record.notes}}</small></span><LocalizedStatusBadge :status="record.status"/></article><p v-if="!relatedMaintenance.length">{{t('equipment.noRecords')}}</p></div><div class="modal-footer"><button class="btn primary" @click="selectedId=''">{{t('billing.close')}}</button></div></article></div>
  </section>
</template>
<style scoped>
.maintenance-tabs{margin-bottom:18px}.equipment-filter{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}.table-scroll{overflow-x:auto}.responsive-table{min-width:690px}.asset-card{min-width:0}.asset-card h3,.pair-box strong{overflow-wrap:anywhere}.modal-card h2{overflow-wrap:anywhere}.list-row{min-width:0}.list-row strong{overflow-wrap:anywhere}@media(max-width:720px){.equipment-filter{grid-template-columns:1fr}}
</style>
