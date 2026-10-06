<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  commands: {
    type: Array,
    required: true
  }
})

const { t } = useI18n({ useScope: 'global' })

const statusClass = (status) => ({
  completed: 'status-pill success',
  pending: 'status-pill warning',
  failed: 'status-pill danger'
}[status] || 'status-pill')
</script>

<template>
  <section class="history-card">
    <header>
      <div>
        <h2>{{ t('remoteControl.history.title') }}</h2>
        <p>{{ t('remoteControl.history.subtitle') }}</p>
      </div>
    </header>

    <div v-if="commands.length === 0" class="empty-state">
      {{ t('remoteControl.empty.noHistory') }}
    </div>

    <table v-else>
      <thead>
      <tr>
        <th>{{ t('remoteControl.history.command') }}</th>
        <th>{{ t('remoteControl.history.device') }}</th>
        <th>{{ t('remoteControl.history.status') }}</th>
        <th>{{ t('remoteControl.history.requestedBy') }}</th>
        <th>{{ t('remoteControl.history.createdAt') }}</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="command in commands" :key="command.id">
        <td>{{ t(`remoteControl.commands.${command.type}`) }}</td>
        <td>{{ command.actuatorName }}</td>
        <td>
            <span :class="statusClass(command.status)">
              {{ t(`remoteControl.commandStatus.${command.status}`) }}
            </span>
        </td>
        <td>{{ command.requestedBy }}</td>
        <td>{{ command.createdAt }}</td>
      </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.history-card {
  padding: 22px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid var(--border);
  box-shadow: 0 16px 38px rgba(31, 41, 79, 0.07);
}

.history-card h2 {
  margin: 0;
}

.history-card p {
  margin: 4px 0 18px;
  color: var(--muted);
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px;
  text-align: left;
  color: var(--muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  background: #f8fafc;
}

td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--border);
}

.status-pill {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
}

.status-pill.success {
  color: #047857;
  background: #d1fae5;
}

.status-pill.warning {
  color: #b45309;
  background: #fef3c7;
}

.status-pill.danger {
  color: #b91c1c;
  background: #fee2e2;
}

.empty-state {
  padding: 18px;
  color: var(--muted);
  font-weight: 700;
  text-align: center;
}
</style>