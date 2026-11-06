<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  helper: { type: String, default: '' },
  icon: { type: String, default: 'pi pi-history' },
  tone: { type: String, default: 'primary' }
})
</script>

<template>
  <article class="audit-metric-card" :class="`tone-${tone}`">
    <span class="audit-metric-icon"><i :class="icon" aria-hidden="true"></i></span>
    <div>
      <small>{{ label }}</small>
      <strong>{{ value }}</strong>
      <span v-if="helper">{{ helper }}</span>
    </div>
  </article>
</template>
