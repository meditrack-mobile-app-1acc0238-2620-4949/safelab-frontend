<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'

const { t } = useI18n()
const demo = useSafeLabDemoStore()
const KEY = 'safelab-platform-preferences-v1'
const defaults = {
  platformName: 'SafeLab',
  supportEmail: 'soporte@safelab.test',
  timezone: 'America/Lima',
  renewalNotices: true,
  incidentNotices: true,
  invitationNotices: true
}

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { ...defaults, ...saved }
  } catch {
    return { ...defaults }
  }
}

const saved = ref(readSaved())
const draft = ref({ ...saved.value })
const edited = computed(() => JSON.stringify(draft.value) !== JSON.stringify(saved.value))
const error = ref('')
const message = ref('')
const basePlan = computed(() => demo.subscriptions[0])

function save() {
  error.value = ''
  message.value = ''
  if (!draft.value.platformName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.value.supportEmail.trim())) {
    error.value = t('platformUi.settingsInvalid')
    return
  }
  saved.value = { ...draft.value, platformName: draft.value.platformName.trim(), supportEmail: draft.value.supportEmail.trim() }
  draft.value = { ...saved.value }
  localStorage.setItem(KEY, JSON.stringify(saved.value))
  message.value = t('platformUi.changesSaved')
}
function cancel() {
  draft.value = { ...saved.value }
  error.value = ''
  message.value = ''
}
</script>

<template>
  <div class="settings-panel">
    <div class="settings-grid">
      <article class="card">
        <div class="card-header"><div><h2><i class="pi pi-building"></i> {{t('platformUi.platformProfile')}}</h2><p>{{t('platformUi.platformProfileHelp')}}</p></div></div>
        <div class="settings-fields">
          <label>{{t('platformUi.platformName')}}<input v-model="draft.platformName" class="input" maxlength="60"/></label>
          <label>{{t('platformUi.supportEmail')}}<input v-model="draft.supportEmail" class="input" type="email" maxlength="150"/></label>
          <label>{{t('platformUi.defaultTimezone')}}<select v-model="draft.timezone" class="select"><option>America/Lima</option><option>America/Bogota</option><option>America/Mexico_City</option><option>UTC</option></select></label>
        </div>
      </article>
      <article class="card">
        <div class="card-header"><div><h2><i class="pi pi-bell"></i> {{t('platformUi.platformNotifications')}}</h2><p>{{t('platformUi.platformNotificationsHelp')}}</p></div></div>
        <label v-for="item in [{key:'renewalNotices',name:'renewalNotices'},{key:'incidentNotices',name:'incidentNotices'},{key:'invitationNotices',name:'invitationNotices'}]" :key="item.key" class="setting-switch">
          <span>{{t(`platformUi.${item.name}`)}}</span>
          <input v-model="draft[item.key]" type="checkbox"/>
        </label>
      </article>
      <article class="card">
        <div class="card-header"><div><h2><i class="pi pi-shield"></i> {{t('platformUi.accessPolicies')}}</h2><p>{{t('platformUi.policyDescription')}}</p></div></div>
        <div class="settings-facts"><div><span>{{t('platformUi.minimumPassword')}}</span><strong>10</strong></div><div><span>{{t('platformUi.invitationHours')}}</span><strong>72 h</strong></div><div><span>{{t('platformUi.activationRequired')}}</span><strong>{{t('platformUi.yes')}}</strong></div></div>
      </article>
      <article class="card">
        <div class="card-header"><div><h2><i class="pi pi-credit-card"></i> {{t('platformUi.licensePolicy')}}</h2><p>{{t('platformUi.licensePolicyHelp')}}</p></div></div>
        <div class="settings-facts"><div><span>{{t('platformUi.includedEmployees')}}</span><strong>{{basePlan?.includedSeats ?? 10}}</strong></div><div><span>{{t('platformUi.managerSeat')}}</span><strong>{{t('platformUi.excluded')}}</strong></div><div><span>{{t('platformUi.extraSeatPrice')}}</span><strong>PEN {{(basePlan?.seatPrice ?? 17).toFixed(2)}}</strong></div></div>
      </article>
    </div>
    <div class="settings-actions">
      <span v-if="edited" class="text-muted">{{t('multi.unsaved')}}</span>
      <span v-else-if="message" class="success-text">{{message}}</span>
      <span v-if="error" class="error-text" role="alert">{{error}}</span>
      <button class="btn" type="button" :disabled="!edited" @click="cancel">{{t('multi.cancel')}}</button>
      <button class="btn primary" type="button" :disabled="!edited" @click="save"><i class="pi pi-save"></i> {{t('multi.saveChanges')}}</button>
    </div>
  </div>
</template>

<style scoped>
.settings-panel{display:grid;gap:18px}.settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:start}.settings-fields{display:grid;gap:15px}.settings-fields label{display:grid;gap:7px;font-size:.83rem;font-weight:750;color:var(--muted)}.card-header h2{display:flex;gap:10px;align-items:center}.card-header h2 i{color:var(--primary)}.card-header p{margin:6px 0 0}.setting-switch{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid var(--border);font-weight:700}.setting-switch input{width:19px;height:19px;accent-color:var(--primary);cursor:pointer}.settings-facts{display:grid;gap:12px}.settings-facts>div{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:13px;border-radius:14px;background:var(--surface-muted)}.settings-facts span{color:var(--muted);font-size:.85rem}.settings-facts strong{color:var(--text)}.settings-actions{display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap}.settings-actions>.text-muted{margin-right:auto}.success-text{color:var(--success)}.error-text{color:var(--danger)}@media(max-width:900px){.settings-grid{grid-template-columns:1fr}}
</style>
