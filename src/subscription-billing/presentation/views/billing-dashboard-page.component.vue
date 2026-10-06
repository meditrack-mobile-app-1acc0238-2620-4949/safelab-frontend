<script setup>
import { onMounted } from 'vue'
import { useSubscriptionBillingStore } from '../../application/stores/subscription-billing.store'
import BillingSummaryCard from '../components/billing-summary-card.component.vue'
import BillingNavigationCard from '../components/billing-navigation-card.component.vue'

const billingStore = useSubscriptionBillingStore()

onMounted(() => {
  billingStore.fetchBillingSummary()
})
</script>

<template>
  <main class="billing-page" aria-labelledby="billing-dashboard-title">
    <header class="page-header">
      <p class="eyebrow">Subscription Billing</p>
      <h1 id="billing-dashboard-title">Billing Dashboard</h1>
      <p>
        Monitor subscription revenue, active customers and pending invoices.
      </p>
    </header>

    <section class="summary-grid">
      <BillingSummaryCard
        label="Plans"
        :value="billingStore.plans.length"
        helper="Available plans"
      />
      <BillingSummaryCard
        label="Active subscriptions"
        :value="billingStore.activeSubscriptions.length"
        helper="Currently active"
      />
      <BillingSummaryCard
        label="Past due"
        :value="billingStore.pastDueSubscriptions.length"
        helper="Need attention"
      />
      <BillingSummaryCard
        label="Monthly revenue"
        :value="`$${billingStore.monthlyRevenue}`"
        helper="Estimated revenue"
      />
    </section>

    <section class="navigation-grid">
      <BillingNavigationCard
        title="Customer Subscriptions"
        description="Search subscriptions and review plan usage."
        to="/subscription-billing/customer-subscriptions"
      />
      <BillingNavigationCard
        title="Invoice History"
        description="Review generated invoices and payment status."
        to="/subscription-billing/invoice-history"
      />
      <BillingNavigationCard
        title="Payment History"
        description="Review successful, pending and failed payments."
        to="/subscription-billing/payment-history"
      />
    </section>
  </main>
</template>

<style scoped>
.billing-page {
  background: #f8fafc;
  display: grid;
  gap: 1.25rem;
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

.navigation-grid,
.summary-grid,
.plan-grid {
  display: grid;
  gap: 1rem;
}

.navigation-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.plan-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.panel {
  background: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  padding: 1rem;
}

.message {
  border-radius: 0.5rem;
  color: #475569;
  padding: 1rem;
}

.error-message {
  background: #fee2e2;
  border-left: 4px solid #dc2626;
  color: #991b1b;
}

@media (max-width: 767px) {
  .billing-page {
    padding: 1rem;
  }
}
</style>
