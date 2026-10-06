<script setup>
defineProps({
  records: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const hasValue = (value) => {
  return value !== null && value !== undefined && value !== ''
}

const formatTemperature = (value) => {
  return hasValue(value) ? `${value} °C` : '—'
}

const formatHumidity = (value) => {
  return hasValue(value) ? `${value} %` : '—'
}
</script>

<template>
  <section class="historical-table-wrapper">
    <p v-if="loading" class="loading-message">
      Loading historical data...
    </p>

    <table v-else class="historical-table">
      <thead>
      <tr>
        <th>Equipment</th>
        <th>Location</th>
        <th>Temperature</th>
        <th>Humidity</th>
        <th>Recorded at</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="record in records" :key="record.id">
        <td>{{ record.equipmentName }}</td>
        <td>{{ record.location }}</td>
        <td>{{ formatTemperature(record.temperature) }}</td>
        <td>{{ formatHumidity(record.humidity) }}</td>
        <td>{{ record.recordedAt || '—' }}</td>
      </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.historical-table-wrapper {
  overflow-x: auto;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid var(--border);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.historical-table {
  width: 100%;
  border-collapse: collapse;
}

.historical-table th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.85rem 1rem;
  text-align: left;
  text-transform: uppercase;
}

.historical-table td {
  border-bottom: 1px solid var(--border);
  color: #0f172a;
  padding: 0.9rem 1rem;
  vertical-align: middle;
}

.historical-table tbody tr:hover {
  background: #f8fafc;
}

.loading-message {
  margin: 0;
  padding: 1rem;
  color: #64748b;
  font-weight: 700;
}
</style>