<script setup>
import StatusBadge from './status-badge.component.vue'

defineProps({
  plan: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="plan-card">
    <header>
      <div>
        <h3>{{ plan.name }}</h3>
        <p>{{ plan.description }}</p>
      </div>
      <StatusBadge :status="plan.status" />
    </header>

    <div class="price">
      <strong>${{ plan.price }}</strong>
      <span>/ {{ plan.billingCycle }}</span>
    </div>

    <ul>
      <li>Max devices: {{ plan.maxDevices }}</li>
      <li>Reports included: {{ plan.includesReports ? 'Yes' : 'No' }}</li>
    </ul>
  </article>
</template>

<style scoped>
.plan-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  padding: 1rem;
}

header {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

h3 {
  color: #0f172a;
  margin: 0;
}

p {
  color: #64748b;
  margin: 0.35rem 0 0;
}

.price {
  align-items: baseline;
  display: flex;
  gap: 0.25rem;
  margin: 1rem 0;
}

.price strong {
  color: #0f172a;
  font-size: 2rem;
}

.price span,
li {
  color: #475569;
}

ul {
  margin: 0;
  padding-left: 1.2rem;
}
</style>
