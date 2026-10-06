<script setup>
import StatusBadge from './status-badge.component.vue'

defineProps({
  payments: {
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
      Loading payments...
    </p>

    <table v-else>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Invoice</th>
          <th>Date</th>
          <th>Method</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="payment in payments" :key="payment.id">
          <td>{{ payment.customerName }}</td>
          <td>{{ payment.invoiceNumber }}</td>
          <td>{{ payment.paymentDate }}</td>
          <td>{{ payment.method }}</td>
          <td>${{ payment.amount }}</td>
          <td><StatusBadge :status="payment.status" /></td>
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

.table-message {
  color: #64748b;
  padding: 1rem;
}
</style>
