<script setup>
import ReportStatusTag from './report-status-tag.component.vue'

defineProps({
  reports: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['download'])
</script>

<template>
  <table class="report-table" aria-label="Generated reports">
    <thead>
    <tr>
      <th>Title</th>
      <th>Equipment</th>
      <th>Date range</th>
      <th>Format</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
    </thead>

    <tbody>
    <tr v-if="loading">
      <td colspan="6">Loading reports...</td>
    </tr>

    <tr
        v-for="report in reports"
        v-else
        :key="report.id"
    >
      <td>{{ report.title }}</td>
      <td>{{ report.equipmentName || 'All equipment' }}</td>
      <td>{{ report.startDate }} - {{ report.endDate }}</td>
      <td>{{ report.format }}</td>
      <td>
        <ReportStatusTag :status="report.status" />
      </td>
      <td>
        <button
            type="button"
            class="secondary-button"
            :disabled="report.status !== 'generated'"
            @click="emit('download', report.id)"
        >
          Download
        </button>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
.report-table {
  background: #ffffff;
  border-collapse: collapse;
  border-radius: 0.75rem;
  overflow: hidden;
  width: 100%;
}

th {
  background: #f1f5f9;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.75rem;
  text-align: left;
  text-transform: uppercase;
}

td {
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  padding: 0.75rem;
}

.secondary-button {
  background: #eef2ff;
  border: none;
  border-radius: 0.5rem;
  color: #4338ca;
  cursor: pointer;
  font-weight: 700;
  padding: 0.5rem 0.75rem;
}

.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
