<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  actuator: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['execute-command'])
const { t } = useI18n({ useScope: 'global' })

const statusClass = (status) => ({
  online: 'status-pill success',
  offline: 'status-pill danger',
  maintenance: 'status-pill warning'
}[status] || 'status-pill')

const safetyClass = (state) => ({
  ready: 'status-pill success',
  locked: 'status-pill danger',
  review: 'status-pill warning'
}[state] || 'status-pill')

const commandLabel = (command) => t(`remoteControl.commands.${command}`)
</script>

<template>
  <article class="actuator-card">
    <header class="actuator-header">
      <div>
        <h3>{{ actuator.name }}</h3>
        <p>{{ actuator.code }}</p>
      </div>

      <span :class="statusClass(actuator.status)">
        {{ t(`remoteControl.status.${actuator.status}`) }}
      </span>
    </header>

    <div class="actuator-meta">
      <div>
        <span>{{ t('remoteControl.table.type') }}</span>
        <strong>{{ t(`remoteControl.types.${actuator.type}`) }}</strong>
      </div>

      <div>
        <span>{{ t('remoteControl.table.location') }}</span>
        <strong>{{ actuator.location }}</strong>
      </div>

      <div>
        <span>{{ t('remoteControl.table.linkedSensor') }}</span>
        <strong>{{ actuator.linkedSensorCode }}</strong>
      </div>

      <div>
        <span>{{ t('remoteControl.table.safetyState') }}</span>
        <strong :class="safetyClass(actuator.safetyState)">
          {{ t(`remoteControl.safetyStates.${actuator.safetyState}`) }}
        </strong>
      </div>
    </div>

    <div class="last-command">
      <span>{{ t('remoteControl.table.lastCommand') }}</span>
      <strong>
        {{ actuator.lastCommand ? commandLabel(actuator.lastCommand) : t('remoteControl.empty.noCommand') }}
      </strong>
      <small>{{ actuator.lastCommandAt || '—' }}</small>
    </div>

    <div class="action-list">
      <button
          v-for="command in actuator.supports"
          :key="command"
          type="button"
          :disabled="disabled || !actuator.isAvailable"
          @click="emit('execute-command', actuator, command)"
      >
        {{ commandLabel(command) }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.actuator-card {
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid var(--border);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
}

.actuator-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.actuator-header h3 {
  margin: 0;
  color: var(--text);
}

.actuator-header p {
  margin: 4px 0 0;
  color: var(--muted);
  font-weight: 700;
  font-size: 0.82rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
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

.actuator-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.actuator-meta div,
.last-command {
  display: grid;
  gap: 4px;
  padding: 12px;
  border-radius: 16px;
  background: #f8fafc;
}

.actuator-meta span,
.last-command span,
.last-command small {
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.actuator-meta strong,
.last-command strong {
  color: var(--text);
}

.action-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-list button {
  border: 0;
  border-radius: 12px;
  padding: 10px 12px;
  color: #ffffff;
  background: #4f46e5;
  font-weight: 800;
  cursor: pointer;
}

.action-list button:hover:not(:disabled) {
  background: #4338ca;
}

.action-list button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 720px) {
  .actuator-meta {
    grid-template-columns: 1fr;
  }
}
</style>