<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDeliveryRuleStore } from '../../application/stores/delivery-rule.store'
import { useRecipientStore } from '../../application/stores/recipient.store'
import DeliveryRuleForm from '../components/delivery-rule-form.component.vue'

const { t } = useI18n()
const deliveryRuleStore = useDeliveryRuleStore()
const recipientStore = useRecipientStore()

const createRule = async (payload) => {
  await deliveryRuleStore.createDeliveryRule(payload)
}

onMounted(async () => {
  await Promise.all([
    deliveryRuleStore.fetchDeliveryRules(),
    recipientStore.fetchRecipients()
  ])
})
</script>

<template>
  <main class="delivery-rules-page" aria-labelledby="delivery-rules-title">
    <header>
      <p class="eyebrow">
        {{ t('alertsNotifications.deliveryRules.eyebrow') }}
      </p>

      <h1 id="delivery-rules-title">
        {{ t('alertsNotifications.deliveryRules.title') }}
      </h1>

      <p>
        {{ t('alertsNotifications.deliveryRules.description') }}
      </p>
    </header>

    <section class="layout-grid">
      <article class="panel">
        <h2>
          {{ t('alertsNotifications.deliveryRules.newRule') }}
        </h2>

        <DeliveryRuleForm
            :recipients="recipientStore.recipients"
            @submit="createRule"
        />
      </article>

      <article class="panel">
        <h2>
          {{ t('alertsNotifications.deliveryRules.configuredRules') }}
        </h2>

        <p
            v-if="deliveryRuleStore.loading"
            class="loading-message"
        >
          {{ t('alertsNotifications.loading.deliveryRules') }}
        </p>

        <p
            v-else-if="deliveryRuleStore.error"
            class="error-message"
            role="alert"
        >
          {{ t('alertsNotifications.errors.loadDeliveryRules') }}
        </p>

        <p
            v-else-if="deliveryRuleStore.deliveryRules.length === 0"
            class="empty-message"
        >
          {{ t('alertsNotifications.empty.deliveryRules') }}
        </p>

        <table
            v-else
            class="rules-table"
        >
          <thead>
          <tr>
            <th>
              {{ t('alertsNotifications.table.minimumSeverity') }}
            </th>

            <th>
              {{ t('alertsNotifications.table.channel') }}
            </th>

            <th>
              {{ t('alertsNotifications.table.recipients') }}
            </th>

            <th>
              {{ t('alertsNotifications.table.active') }}
            </th>
          </tr>
          </thead>

          <tbody>
          <tr
              v-for="rule in deliveryRuleStore.deliveryRules"
              :key="rule.id"
          >
            <td>
              {{ t(`alertsNotifications.severity.${rule.minimumSeverity}`) }}
            </td>

            <td>
              {{ t(`alertsNotifications.channels.${rule.channel}`) }}
            </td>

            <td>
              {{ rule.recipientIds.length }}
            </td>

            <td>
              {{ rule.active ? t('alertsNotifications.deliveryRules.yes') : t('alertsNotifications.deliveryRules.no') }}
            </td>
          </tr>
          </tbody>
        </table>
      </article>
    </section>
  </main>
</template>

<style scoped>
.delivery-rules-page {
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
}

.eyebrow {
  color: #4f46e5;
  font-size: 0.875rem;
  font-weight: 700;
}

h1 {
  color: #0f172a;
  font-size: 2rem;
  margin: 0;
}

h2 {
  color: #0f172a;
  font-size: 1.5rem;
}

p {
  color: #475569;
}

.layout-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 420px 1fr;
  margin-top: 1.5rem;
}

.panel {
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.rules-table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f1f5f9;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.75rem;
  text-align: left;
  text-transform: uppercase;
}

td {
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  padding: 0.75rem;
}

.loading-message,
.empty-message,
.error-message {
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0 0;
}

.loading-message {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.empty-message {
  background: #eff6ff;
  color: #1e40af;
  border-left: 4px solid #2563eb;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  border-left: 4px solid #dc2626;
}

@media (max-width: 900px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>