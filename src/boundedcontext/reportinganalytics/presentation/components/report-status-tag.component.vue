<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusClass = {
  generated: 'generated',
  pending: 'pending',
  failed: 'failed'
}[props.status] || 'pending'
</script>

<template>
  <span :class="['status-tag', statusClass]">
    {{ status }}
  </span>
</template>

<style scoped>
.status-tag {
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  text-transform: capitalize;
}

.generated {
  background: #dcfce7;
  color: #166534;
}

.pending {
  background: #fef3c7;
  color: #92400e;
}

.failed {
  background: #fee2e2;
  color: #991b1b;
}
</style>
