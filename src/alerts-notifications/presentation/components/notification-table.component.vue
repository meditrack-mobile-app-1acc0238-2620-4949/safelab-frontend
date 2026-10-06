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
    <p v-if="loading">Loading notifications...</p>

    <table v-else class="notification-table">
      <thead>
      <tr>
        <th>Message</th>
        <th>Channel</th>
        <th>Status</th>
        <th>Sent at</th>
        <th>Delivered at</th>
        <th>Retries</th>
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
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 1rem;
}

.notification-table {
  width: 100%;
  border-collapse: collapse;
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

.table-action {
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  min-height: 40px;
  padding: 0.5rem 0.75rem;
}

.table-action:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}
</style>