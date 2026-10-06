<script setup>
import { useI18n } from 'vue-i18n'
import AuditStatusBadge from '@/audit-traceability/presentation/components/AuditStatusBadge.vue'

defineProps({
  items: { type: Array, required: true }
})

const { t } = useI18n()
</script>

<template>
  <ol class="traceability-timeline">
    <li v-for="item in items" :key="item.id">
      <span class="timeline-marker"></span>
      <div class="timeline-body">
        <div>
          <strong>{{ item.title }}</strong>
          <small>{{ item.module }} · {{ item.time }}</small>
        </div>
        <AuditStatusBadge :value="item.status" :label="t(`audit.status.${item.status}`)" />
      </div>
    </li>
  </ol>
</template>
