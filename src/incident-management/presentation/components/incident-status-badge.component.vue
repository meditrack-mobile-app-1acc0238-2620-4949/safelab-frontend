<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  status: {
    type: String,
    required: true
  }
})

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <span class="incident-status-badge" :class="`incident-status-badge--${status}`">
    {{ t(`incidentManagement.status.${status}`) }}
  </span>
</template>

<style scoped>
.incident-status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: capitalize;
}

.incident-status-badge--open {
  background: #fee2e2;
  color: #991b1b;
}

.incident-status-badge--investigating {
  background: #fef3c7;
  color: #92400e;
}

.incident-status-badge--resolved {
  background: #dcfce7;
  color: #166534;
}

.incident-status-badge--closed {
  background: #f1f5f9;
  color: #475569;
}
</style>