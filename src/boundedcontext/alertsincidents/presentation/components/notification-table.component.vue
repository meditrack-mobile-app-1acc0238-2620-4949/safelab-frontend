<script setup>
defineProps({
  notifications: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['retry']);
</script>

<template>
  <section class="table-wrapper" aria-label="Notifications table">
    <p v-if="loading">{{ $t('legacy.label_f5e60c3a10') }}</p>

    <table v-else class="notification-table">
      <thead>
      <tr>
        <th>{{ $t('legacy.label_68f4145fee') }}</th>
        <th>{{ $t('legacy.label_879f0b1bef') }}</th>
        <th>{{ $t('legacy.label_bae7d5be70') }}</th>
        <th>{{ $t('legacy.label_a6f45556ee') }}</th>
        <th>{{ $t('legacy.label_c48a7af14e') }}</th>
        <th>{{ $t('legacy.label_13093e568f') }}</th>
        <th aria-label="Actions"></th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="notification in notifications" :key="notification.id">
        <td>{{ notification.message }}</td>
        <td>{{ notification.channel }}</td>
        <td>{{ notification.status }}</td>
        <td>{{ notification.sentAt || 'Not sent' }}</td>
        <td>{{ notification.deliveredAt || 'Not delivered' }}</td>
        <td>{{ notification.retryCount }}</td>
        <td>
          <button
              type="button"
              class="table-action"
              :disabled="notification.status !== 'Failed'"
              @click="emit('retry', notification.id)"
          >
            Retry
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  background: var(--surface-card);
  border-radius: 0.5rem;
  padding: 1rem;
}

.notification-table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: var(--surface-muted);
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.75rem;
  text-align: left;
  text-transform: uppercase;
}

td {
  border-bottom: 1px solid #e2e8f0;
  color: var(--muted);
  padding: 0.75rem;
}

.table-action {
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  background: var(--surface-card);
  color: var(--muted);
  cursor: pointer;
  min-height: 40px;
  padding: 0.5rem 0.75rem;
}

.table-action:disabled {
  background: var(--surface-muted);
  color: #94a3b8;
  cursor: not-allowed;
}
</style>