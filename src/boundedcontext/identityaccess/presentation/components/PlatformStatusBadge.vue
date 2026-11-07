<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ status: { type: String, default: '' }, context: { type: String, default: '' } })
const { t, te } = useI18n()

// The meaning of "active" depends on the record. Here it is a positive
// account/subscription state; alerts use a separate "open" label elsewhere.
const tone = computed(() => {
  const value = props.status.toLowerCase().replaceAll('_', '-')
  if (value === 'active' && ['alerts', 'violations', 'incidents'].includes(props.context)) return 'negative'
  if (['active', 'paid', 'reviewed', 'resolved', 'normal', 'online', 'compliant', 'completed', 'ready', 'confirmed-sample'].includes(value)) return 'positive'
  if (['pending', 'upcoming', 'acknowledged', 'investigating', 'scheduled', 'pending-email-verification', 'in progress', 'maintenance', 'warning'].includes(value)) return 'caution'
  if (['suspended', 'inactive', 'overdue', 'blocked', 'critical', 'offline', 'violation', 'open', 'out-of-range', 'disconnected', 'invalid', 'escalated'].includes(value)) return 'negative'
  return 'neutral'
})
const label = computed(() => {
  const key = `platformUi.state_${props.status.toLowerCase().replaceAll(/[\s-]+/g, '_')}`
  return te(key) ? t(key) : props.status.replaceAll(/[_-]/g, ' ')
})
</script>

<template>
  <span :class="['platform-status', tone]">{{ label }}</span>
</template>

<style scoped>
.platform-status{display:inline-flex;align-items:center;justify-content:center;width:max-content;max-width:100%;padding:6px 11px;border-radius:999px;font-size:.77rem;font-weight:850;line-height:1.2;text-transform:capitalize;overflow-wrap:anywhere}
.positive{color:var(--success);background:color-mix(in srgb,var(--success) 14%,var(--surface-card))}
.caution{color:var(--warning);background:color-mix(in srgb,var(--warning) 17%,var(--surface-card))}
.negative{color:var(--danger);background:color-mix(in srgb,var(--danger) 13%,var(--surface-card))}
.neutral{color:var(--info);background:color-mix(in srgb,var(--info) 13%,var(--surface-card))}
</style>
