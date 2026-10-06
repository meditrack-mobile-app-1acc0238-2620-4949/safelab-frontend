<script setup>
import StatusBadge from './status-badge.component.vue'

defineProps({
  subscriptions: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <section class="table-wrapper">
    <p v-if="loading" class="table-message">
      Loading subscriptions...
    </p>

    <table v-else>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Plan</th>
          <th>Status</th>
          <th>Devices</th>
          <th>Renewal</th>
          <th>Amount</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="subscription in subscriptions" :key="subscription.id">
          <td>
            <strong>{{ subscription.customerName }}</strong>
            <small>{{ subscription.customerEmail }}</small>
          </td>
          <td>{{ subscription.planName }}</td>
          <td><StatusBadge :status="subscription.status" /></td>
          <td>{{ subscription.devicesUsed }} / {{ subscription.devicesLimit }}</td>
          <td>{{ subscription.renewalDate }}</td>
          <td>${{ subscription.amount }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.table-wrapper {
  background: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th {
  background: #f1f5f9;
  color: #334155;
  font-size: 0.75rem;
  padding: 0.75rem 1rem;
  text-align: left;
  text-transform: uppercase;
}

td {
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  padding: 1rem;
}

td strong,
td small {
  display: block;
}

td small,
.table-message {
  color: #64748b;
}

td small {
  margin-top: 0.25rem;
}

.table-message {
  padding: 1rem;
}
</style>
