<script setup>
defineProps({
  trends: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="trend-list">
    <article
        v-for="trend in trends"
        :key="trend.id"
        class="trend-card"
    >
      <span>{{ trend.metric }}</span>
      <strong>{{ trend.value }}</strong>
      <small>{{ trend.label }} · {{ trend.period }}</small>
    </article>
  </div>
</template>

<style scoped>
.trend-list {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.trend-card {
  background: var(--surface-card);
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

span {
  color: var(--muted);
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

strong {
  color: var(--text);
  display: block;
  font-size: 1.5rem;
  margin: 0.4rem 0;
}

small {
  color: var(--muted);
}
</style>
