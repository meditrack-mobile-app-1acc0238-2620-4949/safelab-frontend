<script setup>
defineProps({
  value: { type: String, required: true },
  label: { type: String, required: true }
})
</script>

<template>
  <span class="audit-status-badge" :class="`status-${value}`">{{ label }}</span>
</template>
