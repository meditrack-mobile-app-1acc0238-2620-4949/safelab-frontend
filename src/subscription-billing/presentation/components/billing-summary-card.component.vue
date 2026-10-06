<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  helper: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <article class="summary-card">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <small v-if="helper">{{ helper }}</small>
  </article>
</template>

<style scoped>
.summary-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  padding: 1rem;
}

span {
  color: #64748b;
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

strong {
  color: #0f172a;
  display: block;
  font-size: 1.75rem;
  line-height: 1;
}

small {
  color: #64748b;
  display: block;
  margin-top: 0.5rem;
}
</style>
