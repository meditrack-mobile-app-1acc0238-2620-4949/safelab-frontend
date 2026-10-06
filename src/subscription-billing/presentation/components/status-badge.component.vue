<script setup>
defineProps({
  status: {
    type: String,
    required: true
  }
})

const labels = {
  active: 'Active',
  trial: 'Trial',
  past_due: 'Past due',
  cancelled: 'Cancelled',
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
  successful: 'Successful',
  failed: 'Failed',
  inactive: 'Inactive'
}
</script>

<template>
  <span class="status-badge" :class="`status-${status}`">
    {{ labels[status] || status }}
  </span>
</template>

<style scoped>
.status-badge {
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
}

.status-active,
.status-paid,
.status-successful {
  background: #dcfce7;
  color: #166534;
}

.status-trial,
.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-past_due,
.status-overdue,
.status-failed,
.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.status-inactive {
  background: #e2e8f0;
  color: #334155;
}
</style>
