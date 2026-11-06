<script setup>
defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusClassMap = {
  active: 'status-pending',
  acknowledged: 'status-info',
  resolved: 'status-success',
  escalated: 'status-critical'
}

const statusLabelMap = {
  active: 'Active',
  acknowledged: 'Acknowledged',
  resolved: 'Resolved',
  escalated: 'Escalated'
}
</script>

<template>
  <span class="status-tag" :class="statusClassMap[status]">
    {{ statusLabelMap[status] || status }}
  </span>
</template>

<style scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-info {
  background: #dbeafe;
  color: #1e40af;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-critical {
  background: #fee2e2;
  color: #991b1b;
}
</style>