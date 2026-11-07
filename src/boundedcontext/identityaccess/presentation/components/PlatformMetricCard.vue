<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  caption: { type: String, default: '' },
  icon: { type: String, default: 'chart-bar' },
  tone: { type: String, default: '' }
})
</script>

<template>
  <article :class="['kpi-card',tone]">
    <span class="kpi-icon" aria-hidden="true"><i :class="`pi pi-${icon}`"></i></span>
    <span class="kpi-copy">
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
      <small v-if="caption">{{ caption }}</small>
    </span>
  </article>
</template>
