<script setup>
import LocalizedStatusBadge from '@/shared/presentation/components/LocalizedStatusBadge.vue'
import { downloadCsv } from '@/shared/application/services/csv-export'
import ContextPageHeading from '@/shared/presentation/components/ContextPageHeading.vue'
import { useRecordNavigation } from '@/shared/presentation/composables/useRecordNavigation'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/boundedcontext/identityaccess/application/stores/auth.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
const auth = useAuthStore(); const demo = useSafeLabDemoStore(); auth.restoreSession()
const { t, locale } = useI18n()
const search = ref('')
const user = computed(() => auth.currentUser)
const sensors = computed(() => demo.scopedItems('sensors', user.value))
const incidents = computed(() => demo.scopedItems('incidents', user.value))
const rules = computed(() => demo.complianceRules.filter((rule) => rule.title.toLowerCase().includes(search.value.toLowerCase())))
const activeViolations = computed(() => demo.complianceViolations.filter(v => v.status === 'active'))
const violations = computed(() => {
  const relatedIds = activeViolations.value.map(v => demo.complianceEvaluations.find(e=>e.id===v.evaluationId)?.sensorId).filter(Boolean)
  return sensors.value.filter(sensor=>relatedIds.includes(sensor.id))
})
const selectedViolation = ref(null)
function ruleHasViolation(rule){
  const latest = demo.complianceEvaluations.filter(e=>e.ruleId===rule.id).sort((a,b)=>b.observedAt.localeCompare(a.observedAt))[0]
  return latest?.status==='violation'
}
function validateSensor(sensor){
  demo.updateSensor(sensor.id,{value:sensor.type==='temperature'?4:sensor.type==='humidity'?45:sensor.type==='vibration'?1:sensor.value,status:'normal'})
  for(const violation of activeViolations.value){
    const evaluation=demo.complianceEvaluations.find(e=>e.id===violation.evaluationId)
    if(evaluation?.sensorId===sensor.id) violation.status='resolved'
  }
  demo.persist()
}

function exportCompliance(){
  demo.generateReport('Compliance','Compliance evidence report')
  downloadCsv('safelab-compliance',demo.complianceEvaluations)
}

const compliantRules = computed(() => rules.value.filter((rule) => !ruleHasViolation(rule)).length)
const complianceScore = computed(() => rules.value.length ? Math.round((compliantRules.value / rules.value.length) * 100) : 100)
const { openRecords } = useRecordNavigation()
</script>
<template>
  <section class="page">
    <div class="page-hero compact"><ContextPageHeading :description="$t('legacy.label_f4cc9b8676')" /></div>
    <div class="kpi-grid"><article class="kpi-card"><span class="kpi-icon"><i class="pi pi-check-circle"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_13ed3753db') }}</span><strong>{{ complianceScore }}%</strong><small>{{ $t('legacy.label_153f3effc7') }}</small></div></article><article class="kpi-card"><span class="kpi-icon"><i class="pi pi-wifi"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_ae1deee1b7') }}</span><strong>{{ sensors.length }}</strong><small>{{ $t('legacy.label_d6001c53ac') }}</small></div></article><article class="kpi-card danger"><span class="kpi-icon"><i class="pi pi-exclamation-triangle"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_1982745612') }}</span><strong>{{ violations.length }}</strong><small>{{ $t('legacy.label_4dc5bdd4e7') }}</small></div></article><article class="kpi-card warning"><span class="kpi-icon"><i class="pi pi-file"></i></span><div class="kpi-copy"><span>{{ $t('legacy.label_4ba655f177') }}</span><strong>{{ incidents.filter(i=>!i.evidence).length }}</strong><small>{{ $t('legacy.label_69149dfead') }}</small></div></article></div>
    <div class="filter-bar"><div class="field"><label>{{ $t('legacy.label_d6162b7fff') }}</label><input v-model="search" class="input" placeholder="Temperature, humidity, evidence..."></div><div class="actions"><button v-if="auth.hasPermission('reports.export')" class="btn primary" @click="exportCompliance">{{ $t('legacy.label_fb6d0ba299') }}</button><button class="btn" @click="search=''">{{ $t('legacy.label_67300d0fed') }}</button></div></div>
    <div class="grid-2"><article class="record-summary-card card" role="link" tabindex="0" aria-label="complianceRules" @click="openRecords('environmentalcompliance','complianceRules',$event)" @keydown.enter.self.prevent="openRecords('environmentalcompliance','complianceRules')" @keydown.space.self.prevent="openRecords('environmentalcompliance','complianceRules')"><div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_e7d0577ef5') }}</p><h2>{{ $t('legacy.label_27c5b0dfaf') }}</h2></div></div><div class="item-list"><article v-for="rule in rules" :key="rule.id" class="list-row compact"><span><strong>{{ rule.title }}</strong><small>{{ $t('uiReview.type') }}: {{ rule.type }} · {{ $t('uiReview.evidence') }}: {{ rule.requiredEvidence ? $t('uiReview.required') : $t('uiReview.optional') }}</small></span><span :class="['status-pill', ruleHasViolation(rule) ? 'danger' : 'success']">{{ruleHasViolation(rule) ? $t('platformUi.state_violation') : $t('platformUi.state_compliant')}}</span><button v-if="auth.hasPermission('compliance.manage')" class="btn small" @click="demo.toggleRule(rule.id)">{{rule.status==='active'?$t('uiReview.pause'):$t('uiReview.activate')}}</button></article></div></article><article class="card"><div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_721ef370e7') }}</p><h2>{{ $t('legacy.label_093a5d22c6') }}</h2></div></div><div class="item-list"><article v-for="sensor in violations" :key="sensor.id" class="list-row compact"><span><strong>{{ sensor.name }}</strong><small>{{ $t('uiReview.value') }}: {{ sensor.value }}{{ sensor.unit }} · {{ $t('uiReview.range') }}: {{ sensor.min }} - {{ sensor.max }}{{ sensor.unit }}</small></span><LocalizedStatusBadge :status="sensor.status"/><button v-if="auth.hasPermission('compliance.manage')" class="btn small success" @click="validateSensor(sensor)">{{ $t('legacy.label_6752f198b5') }}</button></article></div></article></div>
    <article class="record-summary-card card" role="link" tabindex="0" aria-label="incidents" @click="openRecords('environmentalcompliance','incidents',$event)" @keydown.enter.self.prevent="openRecords('environmentalcompliance','incidents')" @keydown.space.self.prevent="openRecords('environmentalcompliance','incidents')"><div class="card-header"><div><p class="eyebrow">{{ $t('legacy.label_f3754e0001') }}</p><h2>{{ $t('legacy.label_6aba0773bf') }}</h2></div></div><div class="item-list"><article v-for="incident in incidents" :key="incident.id" class="list-row compact"><span><strong>{{ incident.code }} · {{ incident.title }}</strong><small>{{ $t('uiReview.evidence') }}: {{ incident.evidence }} · {{ incident.description }}</small></span><LocalizedStatusBadge :status="incident.status" context="incidents"/><button v-if="auth.hasPermission('compliance.manage')" class="btn small primary" @click="demo.attachEvidence(incident.id)">{{ $t('legacy.label_7134055ec5') }}</button></article></div></article>

    <div class="grid-2 compliance-detail-grid">
      <article class="record-summary-card card" role="link" tabindex="0" aria-label="complianceEvaluations" @click="openRecords('environmentalcompliance','complianceEvaluations',$event)" @keydown.enter.self.prevent="openRecords('environmentalcompliance','complianceEvaluations')" @keydown.space.self.prevent="openRecords('environmentalcompliance','complianceEvaluations')"><div class="card-header"><div><p class="eyebrow">{{t('environment.evaluations')}}</p><h2>{{t('environment.evaluationHistory')}}</h2></div></div><div class="table-scroll"><table class="responsive-table"><thead><tr><th>ID</th><th>{{t('environment.rule')}}</th><th>{{t('environment.value')}}</th><th>{{t('environment.time')}}</th><th>{{t('environment.result')}}</th></tr></thead><tbody><tr v-for="evaluation in demo.complianceEvaluations.slice(0,4)" :key="evaluation.id"><td>{{evaluation.id}}</td><td>{{evaluation.ruleId}}</td><td>{{evaluation.value}}</td><td>{{evaluation.observedAt}}</td><td><LocalizedStatusBadge :status="evaluation.status"/></td></tr></tbody></table></div></article>
      <article class="record-summary-card card" role="link" tabindex="0" aria-label="complianceViolations" @click="openRecords('environmentalcompliance','complianceViolations',$event)" @keydown.enter.self.prevent="openRecords('environmentalcompliance','complianceViolations')" @keydown.space.self.prevent="openRecords('environmentalcompliance','complianceViolations')"><div class="card-header"><div><p class="eyebrow">{{t('environment.violations')}}</p><h2>{{t('environment.violationHistory')}}</h2></div></div><div class="item-list"><button v-for="violation in demo.complianceViolations" :key="violation.id" class="list-row violation-row" type="button" @click="selectedViolation=violation"><span><strong>{{violation.id}} · {{violation.evaluationId}}</strong><small>{{violation.startedAt}} · {{violation.incidentCode||'—'}}</small></span><LocalizedStatusBadge :status="violation.status" context="violations"/><i class="pi pi-chevron-right"></i></button></div></article>
    </div>
    <div v-if="selectedViolation" class="modal-backdrop" @click.self="selectedViolation=null"><article class="card modal-card medium" role="dialog" aria-modal="true"><header class="modal-header"><div><p class="eyebrow">{{t('environment.violationDetails')}}</p><h2>{{selectedViolation.id}}</h2></div><button type="button" class="icon-action" @click="selectedViolation=null"><i class="pi pi-times"></i></button></header><div class="pair-grid"><div v-for="[label,value] in [[t('environment.evaluation'),selectedViolation.evaluationId],[t('environment.incident'),selectedViolation.incidentCode||'—'],[t('environment.started'),selectedViolation.startedAt],[t('environment.resolved'),selectedViolation.endedAt||'—'],[t('environment.severity'),selectedViolation.severity],[t('environment.result'),selectedViolation.status]]" :key="label" class="pair-box"><span>{{label}}</span><strong>{{value}}</strong></div></div><div class="modal-footer"><button type="button" class="btn primary" @click="selectedViolation=null">{{t('billing.close')}}</button></div></article></div>
  </section>
</template>

<style scoped>.table-scroll{overflow-x:auto}.responsive-table{min-width:600px}.violation-row{grid-template-columns:minmax(0,1fr) auto 16px;text-align:left;width:100%;cursor:pointer;color:var(--text)}.violation-row strong{overflow-wrap:anywhere}.compliance-detail-grid{align-items:start}.modal-card h2{overflow-wrap:anywhere}</style>
