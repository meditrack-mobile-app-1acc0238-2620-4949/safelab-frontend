<script setup>
import { computed } from 'vue'

const props = defineProps({
  values: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  unit: { type: String, default: '' }
})

const points = computed(() => {
  if (!props.values.length) return ''
  const min = Math.min(...props.values)
  const max = Math.max(...props.values)
  const range = max - min || 1
  return props.values.map((value, index) => {
    const x = (index / Math.max(props.values.length - 1, 1)) * 100
    const y = 42 - ((value - min) / range) * 34
    return `${x},${y}`
  }).join(' ')
})

const currentValue = computed(() => props.values.at(-1) ?? '-')
</script>

<template>
  <article class="mini-chart-card">
    <div class="mini-chart-header">
      <span>{{ label }}</span>
      <strong>{{ currentValue }}{{ unit }}</strong>
    </div>
    <svg viewBox="0 0 100 48" role="img" :aria-label="label" preserveAspectRatio="none">
      <polyline class="chart-area" :points="points" />
      <polyline class="chart-line" :points="points" />
    </svg>
  </article>
</template>
