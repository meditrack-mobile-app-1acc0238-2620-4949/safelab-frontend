<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AlertSeverityTag from './alert-severity-tag.component.vue'
import AlertStatusTag from './alert-status-tag.component.vue'

defineProps({
  alerts: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const { t } = useI18n({ useScope: 'global' })

const goToDetail = (alert) => {
  router.push({
    name: 'alerts-notifications-alert-detail',
    params: { id: alert.id }
  })
}
</script>

<template>
  <section class="alert-table-wrapper" :aria-label="t('alertsNotifications.table.alertsTable')">
    <p v-if="loading" class="loading-message">
      {{ t('alertsNotifications.loading.alerts') }}
    </p>

    <table v-else class="alert-table">
      <thead>
      <tr>
        <th>{{ t('alertsNotifications.table.type') }}</th>
        <th>{{ t('alertsNotifications.table.device') }}</th>
        <th>{{ t('alertsNotifications.table.location') }}</th>
        <th>Scope</th>
        <th>{{ t('alertsNotifications.table.severity') }}</th>
        <th>{{ t('alertsNotifications.table.status') }}</th>
        <th>{{ t('alertsNotifications.table.createdAt') }}</th>
        <th>{{ t('alertsNotifications.table.actions') }}</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="alert in alerts" :key="alert.id">
        <td>
          <strong>{{ alert.type }}</strong>
          <small>{{ alert.title }}</small>
        </td>

        <td>{{ alert.deviceName }}</td>
        <td>{{ alert.location }}</td>
        <td>
          <strong>{{ alert.ownerName || alert.facilityName || '—' }}</strong>
          <small v-if="alert.segment">{{ alert.segment }}</small>
        </td>

        <td>
          <AlertSeverityTag :severity="alert.severity" />
        </td>

        <td>
          <AlertStatusTag :status="alert.status" />
        </td>

        <td>{{ alert.createdAt }}</td>

        <td>
          <button
              class="table-action"
              type="button"
              :aria-label="t('alertsNotifications.actions.viewDetails')"
              @click="goToDetail(alert)"
          >
            {{ t('alertsNotifications.actions.viewDetails') }}
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.alert-table-wrapper {
  overflow-x: auto;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid var(--border);
  box-shadow: 0 16px 38px rgba(31, 41, 79, 0.07);
}

.alert-table {
  width: 100%;
  border-collapse: collapse;
}

.alert-table th {
  background: #f8fafc;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.85rem 1rem;
  text-align: left;
  text-transform: uppercase;
}

.alert-table td {
  border-bottom: 1px solid var(--border);
  color: var(--text);
  padding: 1rem;
  vertical-align: middle;
}

.alert-table tbody tr:hover {
  background: #f8fafc;
}

.alert-table td strong {
  display: block;
}

.alert-table td small {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-weight: 600;
}

.table-action {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: white;
  color: var(--text);
  cursor: pointer;
  font-weight: 800;
  min-height: 38px;
  padding: 0.45rem 0.75rem;
}

.table-action:hover {
  background: #eef2ff;
  color: #4f46e5;
}

.loading-message {
  padding: 1rem;
  color: var(--muted);
  font-weight: 700;
}
</style>