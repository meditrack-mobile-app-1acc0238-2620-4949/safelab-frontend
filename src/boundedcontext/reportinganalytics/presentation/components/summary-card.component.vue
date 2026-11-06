<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: '-'
  },
  helper: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <article class="summary-card">
    <span class="summary-label">{{ label }}</span>
    <strong>{{ value }}</strong>
    <small v-if="helper">{{ helper }}</small>
  </article>
</template>

<style scoped>
.summary-card {
  background: var(--surface-card);
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.summary-label {
  color: var(--muted);
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

strong {
  color: var(--text);
  display: block;
  font-size: 2rem;
}

small {
  color: var(--muted);
}
</style>
