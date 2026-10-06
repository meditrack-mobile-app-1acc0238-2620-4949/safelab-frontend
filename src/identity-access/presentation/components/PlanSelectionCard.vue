<script setup>
defineProps({
  plan: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  recommended: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select'])
</script>

<template>
  <button
      type="button"
      class="plan-card"
      :class="{ selected }"
      @click="$emit('select', plan)"
  >
    <div>
      <span v-if="recommended" class="recommended">Recommended</span>
      <strong>{{ plan.name }}</strong>
      <small>{{ plan.description }}</small>
    </div>

    <p>${{ plan.monthlyCost }} <span>/ month</span></p>
  </button>
</template>

<style scoped>
.plan-card {
  width: 100%;
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #0f172a;
  text-align: left;
  cursor: pointer;
}

.plan-card.selected {
  border-color: #4f46e5;
  background: #eef2ff;
}

.recommended {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 0.45rem;
  padding: 5px 9px;
  border-radius: 999px;
  color: #047857;
  background: #d1fae5;
  font-size: 0.7rem;
  font-weight: 900;
}

strong,
small {
  display: block;
}

small {
  margin-top: 0.3rem;
  color: #64748b;
  font-weight: 600;
}

p {
  margin: 0;
  color: #4f46e5;
  font-size: 1.4rem;
  font-weight: 900;
}

p span {
  color: #64748b;
  font-size: 0.85rem;
}
</style>