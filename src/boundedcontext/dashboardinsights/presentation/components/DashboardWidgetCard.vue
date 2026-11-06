<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  status: { type: String, default: 'neutral' },
  route: { type: String, default: '' }
})
</script>

<template>
  <RouterLink v-if="route" :to="route" class="dashboard-widget-card" :class="`is-${status}`">
    <div>
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
    </div>
    <span>{{ value }}</span>
  </RouterLink>
  <article v-else class="dashboard-widget-card" :class="`is-${status}`">
    <div>
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
    </div>
    <span>{{ value }}</span>
  </article>
</template>
