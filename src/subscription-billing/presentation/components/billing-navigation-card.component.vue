<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  }
})
</script>

<template>
  <RouterLink class="navigation-card" :to="to">
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </RouterLink>
</template>

<style scoped>
.navigation-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  color: inherit;
  padding: 1.25rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.navigation-card:hover {
  border-color: #4f46e5;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.08);
  transform: translateY(-2px);
}

h3 {
  color: #0f172a;
  margin: 0 0 0.5rem;
}

p {
  color: #64748b;
  margin: 0;
}
</style>
