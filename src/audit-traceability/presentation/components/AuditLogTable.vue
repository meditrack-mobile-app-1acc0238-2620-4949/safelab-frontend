<script setup>
import { useI18n } from 'vue-i18n'
import AuditStatusBadge from '@/audit-traceability/presentation/components/AuditStatusBadge.vue'

defineProps({
  logs: { type: Array, required: true }
})

const { t } = useI18n()
</script>

<template>
  <div class="audit-table-wrap">
    <table class="audit-table">
      <thead>
        <tr>
          <th>{{ t('audit.table.id') }}</th>
          <th>{{ t('audit.table.actor') }}</th>
          <th>{{ t('audit.table.action') }}</th>
          <th>{{ t('audit.table.module') }}</th>
          <th>{{ t('audit.table.severity') }}</th>
          <th>{{ t('audit.table.status') }}</th>
          <th>{{ t('audit.table.createdAt') }}</th>
          <th>{{ t('audit.table.evidence') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td><strong>{{ log.id }}</strong></td>
          <td>{{ log.actor }}</td>
          <td>{{ log.action }}</td>
          <td>{{ log.module }}</td>
          <td><AuditStatusBadge :value="log.severity" :label="t(`audit.severity.${log.severity}`)" /></td>
          <td><AuditStatusBadge :value="log.status" :label="t(`audit.status.${log.status}`)" /></td>
          <td>{{ log.createdAt }}</td>
          <td>{{ log.evidenceId }}</td>
        </tr>
        <tr v-if="!logs.length">
          <td colspan="8" class="audit-empty-state">{{ t('audit.emptyLogs') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
