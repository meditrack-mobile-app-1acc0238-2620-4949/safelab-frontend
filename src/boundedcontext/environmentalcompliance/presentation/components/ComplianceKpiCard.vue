<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
})
</script>

<template>
  <article class="kpi-card">
    <i :class="icon" aria-hidden="true" />
    <div>
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
    </div>
  </article>
</template>

<style scoped>
.kpi-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 25px rgba(31, 41, 79, 0.06);
}

.kpi-card i {
  font-size: 1.3rem;
  color: var(--primary);
}

.kpi-card span {
  display: block;
  color: var(--muted);
  font-size: 0.85rem;
}

.kpi-card strong {
  font-size: 1.5rem;
}
</style>

