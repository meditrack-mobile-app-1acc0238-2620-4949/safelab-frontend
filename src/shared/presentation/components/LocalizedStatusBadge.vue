<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// One visual vocabulary for operational tables and user/invitation states.
// This is presentation-only: the original stored status is never changed.
const props = defineProps({
  status: { type: String, default: '' },
  context: { type: String, default: '' } // e.g. an active alert is not a healthy state.
})
const { t, te } = useI18n()
const state = computed(() => String(props.status || '').toLowerCase().trim().replaceAll(/[\s-]+/g, '_'))
const label = computed(() => {
  const key = `platformUi.state_${state.value}`
  return te(key) ? t(key) : String(props.status || '—').replaceAll(/[_-]/g, ' ')
})
const tone = computed(() => {
  const s = state.value
  if (s === 'active' && ['alerts', 'violations', 'incidents'].includes(props.context)) return 'negative'
  if (['active','paid','reviewed','resolved','normal','online','compliant','completed','ready','confirmed_sample','enabled','controlled'].includes(s)) return 'positive'
  if (['pending','upcoming','acknowledged','investigating','scheduled','in_progress','maintenance','pending_email_verification','warning','on_hold','medium'].includes(s)) return 'caution'
  if (['suspended','inactive','overdue','blocked','critical','offline','disconnected','violation','open','out_of_range','invalid','escalated','high_risk','high'].includes(s)) return 'negative'
  return 'neutral'
})
</script>
<template><span :class="['localized-status', tone]">{{ label }}</span></template>
<style scoped>
.localized-status{display:inline-flex;align-items:center;justify-content:center;max-width:100%;width:max-content;padding:5px 10px;border-radius:999px;font-size:.77rem;font-weight:800;line-height:1.3;overflow-wrap:break-word;white-space:normal}
.positive{color:var(--success);background:color-mix(in srgb,var(--success) 14%,var(--surface-card))}
.caution{color:var(--warning);background:color-mix(in srgb,var(--warning) 17%,var(--surface-card))}
.negative{color:var(--danger);background:color-mix(in srgb,var(--danger) 13%,var(--surface-card))}
.neutral{color:var(--info);background:color-mix(in srgb,var(--info) 13%,var(--surface-card))}
</style>
