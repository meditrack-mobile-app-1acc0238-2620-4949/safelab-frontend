<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  sensor: {
    type: Object,
    required: true
  }
})

const { t } = useI18n({ useScope: 'global' })

const metricLabelByType = {
  Temperature: 'menu.sensors.monitoring.metrics.currentTemperature',
  Humidity: 'menu.sensors.monitoring.metrics.currentHumidity',
  DoorStatus: 'menu.sensors.monitoring.metrics.currentDoorStatus',
  Vibration: 'menu.sensors.monitoring.metrics.currentVibration',
  Energy: 'menu.sensors.monitoring.metrics.currentEnergy'
}

const unitByType = {
  Temperature: '°C',
  Humidity: '%',
  DoorStatus: '',
  Vibration: 'mm/s',
  Energy: 'kWh'
}

const formatValue = (sensor) => {
  const unit = unitByType[sensor.type] ?? ''

  if (typeof sensor.value !== 'number') {
    return `${sensor.value ?? '—'}${unit}`
  }

  if (sensor.type === 'Temperature') {
    return `${sensor.value.toFixed(1)}${unit}`
  }

  if (sensor.type === 'Humidity') {
    return `${sensor.value.toFixed(0)}${unit}`
  }

  return `${sensor.value}${unit}`
}

const formatThreshold = (sensor) => {
  const threshold = Array.isArray(sensor.thresholds) ? sensor.thresholds[0] : null

  if (!threshold) {
    return t('menu.sensors.monitoring.details.notAvailable')
  }

  const unit = unitByType[sensor.type] ?? ''

  return `${threshold.minValue}-${threshold.maxValue}${unit}`
}

const formatAbsolute = (date) => {
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const formatRelative = (diffMs) => {
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 10) {
    return t('menu.sensors.monitoring.time.justNow')
  }

  const diffMinutes = Math.floor(diffSeconds / 60)

  if (diffMinutes < 1) {
    return t('menu.sensors.monitoring.time.secondsAgo', { count: diffSeconds })
  }

  return t('menu.sensors.monitoring.time.minutesAgo', { count: diffMinutes })
}

const formatLastReading = (date) => {
  if (!date) {
    return '—'
  }

  const diffMs = Date.now() - date.getTime()

  if (diffMs >= 0 && diffMs <= 60 * 60 * 1000) {
    return formatRelative(diffMs)
  }

  return formatAbsolute(date)
}

const statusClass = (status) => ({
  Normal: 'status-dot normal',
  OutOfRange: 'status-dot out-of-range',
  Invalid: 'status-dot invalid'
}[status] || 'status-dot')

const sensorStatusClass = (status) => ({
  Active: 'sensor-status active',
  Inactive: 'sensor-status inactive',
  Disconnected: 'sensor-status disconnected',
  Maintenance: 'sensor-status maintenance'
}[status] || 'sensor-status')
</script>

<template>
  <article class="sensor-card">
    <header class="sensor-card-header">
      <div>
        <h2>{{ sensor.name }}</h2>
        <p>{{ sensor.code }}</p>
      </div>

      <span
          :class="statusClass(sensor.status)"
          :aria-label="t('menu.sensors.monitoring.aria.status', {
          status: t(`menu.sensors.monitoring.readingStatus.${sensor.status}`)
        })"
      />
    </header>

    <div class="sensor-type-row">
      <span>
        {{ t(`menu.sensors.monitoring.types.${sensor.type}`) }}
      </span>

      <strong :class="sensorStatusClass(sensor.sensorStatus)">
        {{ t(`menu.sensors.monitoring.sensorStatus.${sensor.sensorStatus}`) }}
      </strong>
    </div>

    <div class="sensor-reading">
      <p>
        {{ metricLabelByType[sensor.type]
          ? t(metricLabelByType[sensor.type])
          : t('menu.sensors.monitoring.metrics.currentValue')
        }}
      </p>

      <strong>{{ formatValue(sensor) }}</strong>
    </div>

    <div class="sensor-meta">
      <div class="sensor-meta-row">
        <span>{{ t('menu.sensors.monitoring.details.readingStatus') }}</span>
        <strong>{{ t(`menu.sensors.monitoring.readingStatus.${sensor.status}`) }}</strong>
      </div>

      <div class="sensor-meta-row">
        <span>{{ t('menu.sensors.monitoring.details.targetRange') }}</span>
        <strong>{{ formatThreshold(sensor) }}</strong>
      </div>

      <div class="sensor-meta-row">
        <span>{{ t('menu.sensors.monitoring.details.lastReading') }}</span>
        <strong>{{ formatLastReading(sensor.lastReadingAt) }}</strong>
      </div>

      <div v-if="sensor.ownerName || sensor.facilityName" class="sensor-meta-row">
        <span>Scope</span>
        <strong>{{ sensor.ownerName || sensor.facilityName }}</strong>
      </div>
    </div>
  </article>
</template>

<style scoped>
.sensor-card {
  border-radius: 22px;
  border: 1px solid var(--border);
  background: #ffffff;
  padding: 18px;
  display: grid;
  gap: 14px;
  box-shadow: 0 10px 25px rgba(31, 41, 79, 0.06);
}

.sensor-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.sensor-card-header h2 {
  font-size: 1.05rem;
  margin-bottom: 4px;
}

.sensor-card-header p {
  margin: 0;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--muted);
  box-shadow: 0 0 0 4px rgba(104, 117, 141, 0.15);
}

.status-dot.normal {
  background: var(--success);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.18);
}

.status-dot.out-of-range {
  background: var(--danger);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.18);
}

.status-dot.invalid {
  background: var(--warning);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.18);
}

.sensor-type-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sensor-type-row span {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.sensor-status {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
}

.sensor-status.active {
  color: #047857;
  background: #d1fae5;
}

.sensor-status.inactive {
  color: #475569;
  background: #e2e8f0;
}

.sensor-status.disconnected {
  color: #b91c1c;
  background: #fee2e2;
}

.sensor-status.maintenance {
  color: #b45309;
  background: #fef3c7;
}

.sensor-reading {
  background: var(--surface-soft);
  border-radius: 18px;
  padding: 14px;
  display: grid;
  gap: 6px;
}

.sensor-reading p {
  margin: 0;
  color: var(--muted);
  font-weight: 600;
}

.sensor-reading strong {
  font-size: 1.5rem;
}

.sensor-meta {
  display: grid;
  gap: 8px;
  font-size: 0.85rem;
}

.sensor-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sensor-meta span {
  color: var(--muted);
}

.sensor-meta strong {
  display: block;
  margin-top: 4px;
  color: var(--text);
  text-align: right;
}

@media (max-width: 720px) {
  .sensor-meta-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .sensor-meta strong {
    text-align: left;
  }
}
</style>