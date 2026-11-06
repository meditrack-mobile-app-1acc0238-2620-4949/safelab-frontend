<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: Number, required: true }
})
</script>

<template>
  <div class="traceability-health-bar">
    <div class="health-label">
      <span>{{ label }}</span>
      <strong>{{ value }}%</strong>
    </div>
    <div class="health-track"><span :style="{ width: `${value}%` }"></span></div>
  </div>
</template>
