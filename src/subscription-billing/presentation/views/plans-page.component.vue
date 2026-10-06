<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useSubscriptionBillingStore } from '../../application/stores/subscription-billing.store'
import StatusBadge from '../components/status-badge.component.vue'

const billingStore = useSubscriptionBillingStore()

onMounted(() => {
  billingStore.fetchBillingSummary()
})

const currentSubscription = computed(() => billingStore.subscriptions[0] || null)

const latestInvoice = computed(() => billingStore.invoices[0] || null)

const usagePercentage = computed(() => {
  if (!currentSubscription.value) return 0

  return Math.round(
    (currentSubscription.value.devicesUsed / currentSubscription.value.devicesLimit) * 100
  )
})
</script>

<template>
  <main class="billing-page">
    <header class="page-header">
      <p class="eyebrow">Subscription Billing</p>

      <h1>My Subscription</h1>

      <p>
        Review your current plan, billing information and usage limits.
      </p>
    </header>

    <section v-if="currentSubscription" class="hero-card">
      <div class="hero-grid">
        <div>
          <span class="metric-label">Current Plan</span>

          <div class="metric-value">
            {{ currentSubscription.planName }}
          </div>
        </div>

        <div>
          <span class="metric-label">Status</span>

          <StatusBadge :status="currentSubscription.status" />
        </div>

        <div>
          <span class="metric-label">Renewal Date</span>

          <div class="metric-value">
            {{ currentSubscription.renewalDate }}
          </div>
        </div>

        <div>
          <span class="metric-label">Monthly Cost</span>

          <div class="metric-value">
            ${{ currentSubscription.amount }}
          </div>
        </div>
      </div>

      <div class="usage-section">
        <span class="metric-label">
          Device Usage
        </span>

        <strong>
          {{ currentSubscription.devicesUsed }} / {{ currentSubscription.devicesLimit }} devices
        </strong>

        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${usagePercentage}%` }"
          />
        </div>
      </div>
    </section>

    <section class="action-grid">
      <RouterLink
        class="action-button"
        to="/subscription-billing/invoice-history"
      >
        View Invoices
      </RouterLink>

      <RouterLink
        class="action-button"
        to="/subscription-billing/payment-history"
      >
        Payment History
      </RouterLink>

      <RouterLink
        class="action-button"
        to="/subscription-billing/subscription-status"
      >
        Usage & Limits
      </RouterLink>

      <RouterLink
        class="action-button"
        to="/subscription-billing/upgrade-plan"
      >
        Upgrade Plan
      </RouterLink>
    </section>

    <section class="panel">
      <h2>Recent Billing Activity</h2>

      <div class="activity-grid">
        <div class="activity-card">
          <span class="metric-label">Latest Invoice</span>

          <strong>
            {{ latestInvoice?.number || '-' }}
          </strong>

          <p>
            Most recent generated invoice for your subscription.
          </p>
        </div>

        <div class="activity-card">
          <span class="metric-label">Billing Cycle</span>

          <strong>
            Monthly
          </strong>

          <p>
            Your subscription renews automatically every billing cycle.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.billing-page {
  background: #f8fafc;
  display: grid;
  gap: 1.5rem;
  min-height: 100vh;
  padding: 2rem;
}

.page-header {
  margin-bottom: 0.25rem;
}

.eyebrow {
  color: #4f46e5;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0 0 0.25rem;
  text-transform: uppercase;
}

h1 {
  color: #0f172a;
  font-size: 2rem;
  margin: 0;
}

h2 {
  color: #0f172a;
  margin: 0 0 1rem;
}

p {
  color: #475569;
}

.hero-card,
.panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
}

.hero-grid,
.action-grid,
.activity-grid {
  display: grid;
  gap: 1rem;
}

.hero-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.action-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.activity-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.metric-label {
  color: #64748b;
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.metric-value {
  color: #0f172a;
  font-size: 1.6rem;
  font-weight: 800;
}

.usage-section {
  margin-top: 1.5rem;
}

.progress-bar {
  background: #e2e8f0;
  border-radius: 999px;
  height: 10px;
  margin-top: 0.75rem;
  overflow: hidden;
}

.progress-fill {
  background: #4f46e5;
  height: 100%;
}

.action-button {
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  color: #0f172a;
  display: flex;
  font-weight: 700;
  justify-content: center;
  min-height: 72px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-button:hover {
  border-color: #4f46e5;
  transform: translateY(-2px);
}

.activity-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
}

.activity-card strong {
  color: #0f172a;
  display: block;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 767px) {
  .billing-page {
    padding: 1rem;
  }
}
</style>