<script setup>
defineProps({
  status: { type: String, default: 'neutral' },
  label: { type: String, required: true }
})
</script>

<template>
  <span class="status-badge" :class="`is-${status}`">{{ label }}</span>
</template>
