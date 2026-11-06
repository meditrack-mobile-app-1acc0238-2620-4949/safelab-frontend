<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  trend: { type: String, default: '' },
  status: { type: String, default: 'neutral' },
  icon: { type: String, default: 'pi pi-chart-line' }
})
</script>

<template>
  <article class="dashboard-metric-card" :class="`is-${status}`">
    <div class="metric-icon" aria-hidden="true"><i :class="icon" /></div>
    <div>
      <span>{{ label }}</span>
      <strong>{{ value }}<small v-if="unit">{{ unit }}</small></strong>
    </div>
    <em v-if="trend">{{ trend }}</em>
  </article>
</template>
