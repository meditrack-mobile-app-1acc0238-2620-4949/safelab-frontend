<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  rule: {
    type: Object,
    required: true
  }
})

const { t } = useI18n({ useScope: 'global' })

const badgeClass = (status) =>
    status === 'Violation' ? 'status-pill danger' : 'status-pill success'

const unitByType = {
  Temperature: '°C',
  Humidity: '%',
  Energy: 'kWh',
  Vibration: 'mm/s',
  DoorStatus: ''
}

const labelKeyByType = {
  Temperature: 'menu.compliance.status.ruleLabels.temperatureRange',
  Humidity: 'menu.compliance.status.ruleLabels.humidityMax',
  Energy: 'menu.compliance.status.ruleLabels.energyRange',
  Vibration: 'menu.compliance.status.ruleLabels.vibrationRange',
  DoorStatus: 'menu.compliance.status.ruleLabels.doorStatus'
}

const formatRange = (rule) => {
  const unit = unitByType[rule.type] ?? ''
  return `${rule.minValue} - ${rule.maxValue}${unit}`
}
</script>

<template>
  <article class="rule-row">
    <div>
      <strong>
        {{ t(labelKeyByType[rule.type] ?? 'menu.compliance.status.ruleLabels.generic') }}:
        {{ formatRange(rule) }}
      </strong>

      <p>
        {{ t('menu.compliance.status.ruleType', {
        type: t(`menu.compliance.status.types.${rule.type}`)
      }) }}
      </p>
    </div>

    <div class="rule-meta">
      <div>
        <span>{{ t('menu.compliance.status.sensorsLabel') }}</span>
        <strong>{{ rule.sensorCount }}</strong>
      </div>

      <div>
        <span>{{ t('menu.compliance.status.violationsLabel') }}</span>
        <strong>{{ rule.violationCount }}</strong>
      </div>

      <span :class="badgeClass(rule.status)">
        {{
          rule.status === 'Violation'
              ? t('menu.compliance.status.badges.violation')
              : t('menu.compliance.status.badges.compliant')
        }}
      </span>
    </div>
  </article>
</template>

<style scoped>
.rule-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #fbfcff;
}

.rule-row p {
  margin: 4px 0 0;
  font-size: 0.82rem;
  color: var(--muted);
  font-weight: 600;
}

.rule-meta {
  display: flex;
  align-items: center;
  gap: 18px;
}

.rule-meta span {
  color: var(--muted);
  font-size: 0.82rem;
}

.rule-meta strong {
  display: block;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.75rem;
}

.status-pill.success {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.status-pill.danger {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

@media (max-width: 720px) {
  .rule-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .rule-meta {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
}
</style>