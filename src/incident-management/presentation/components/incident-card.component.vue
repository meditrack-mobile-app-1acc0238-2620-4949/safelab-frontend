<script setup>
import { useI18n } from 'vue-i18n'
import IncidentStatusBadge from './incident-status-badge.component.vue'

defineProps({
  incident: {
    type: Object,
    required: true
  }
})

defineEmits(['view-detail'])

const { t } = useI18n({ useScope: 'global' })

const formatDate = (value) => {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const pad = (number) => String(number).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
</script>

<template>
  <article class="incident-card" :class="`incident-card--${incident.severity}`">
    <div class="incident-card__header">
      <div>
        <p class="incident-card__eyebrow">
          {{ incident.code || `INC-${incident.id}` }} ·
          {{ t(`incidentManagement.severity.${incident.severity}`) }}
        </p>

        <h3 class="incident-card__title">
          {{ incident.title }}
        </h3>
      </div>

      <IncidentStatusBadge :status="incident.status" />
    </div>

    <p class="incident-card__description">
      {{ incident.description }}
    </p>

    <dl class="incident-card__meta">
      <div>
        <dt>{{ t('incidentManagement.fields.assignedTo') }}</dt>
        <dd>{{ incident.assignedTo || t('incidentManagement.empty.unassigned') }}</dd>
      </div>

      <div>
        <dt>{{ t('incidentManagement.fields.affectedArea') }}</dt>
        <dd>{{ incident.affectedArea || t('incidentManagement.empty.notSpecified') }}</dd>
      </div>

      <div>
        <dt>{{ t('incidentManagement.fields.relatedSensor') }}</dt>
        <dd>{{ incident.relatedSensorCode || '—' }}</dd>
      </div>

      <div>
        <dt>Scope</dt>
        <dd>{{ incident.ownerName || incident.facilityName || '—' }}</dd>
      </div>

      <div>
        <dt>{{ t('incidentManagement.fields.dueDate') }}</dt>
        <dd>{{ incident.dueDate || '—' }}</dd>
      </div>
    </dl>

    <footer class="incident-card__footer">
      <small>
        {{ t('incidentManagement.fields.createdAt') }} {{ formatDate(incident.createdAt) }}
      </small>

      <button
          class="incident-card__button"
          type="button"
          @click="$emit('view-detail', incident.id)"
      >
        {{ t('incidentManagement.actions.viewDetails') }}
      </button>
    </footer>
  </article>
</template>

<style scoped>
.incident-card {
  border-left: 4px solid #475569;
  border-radius: 18px;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  border-top: 1px solid var(--border);
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.incident-card--critical {
  border-left-color: #dc2626;
}

.incident-card--warning {
  border-left-color: #f59e0b;
}

.incident-card--info {
  border-left-color: #2563eb;
}

.incident-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.incident-card__eyebrow {
  margin: 0 0 0.25rem;
  color: #4f46e5;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.incident-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.125rem;
}

.incident-card__description {
  margin: 0.75rem 0;
  color: #334155;
  line-height: 1.5;
}

.incident-card__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}

.incident-card__meta div {
  border-radius: 14px;
  background: #f8fafc;
  padding: 0.75rem;
}

.incident-card__meta dt {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.incident-card__meta dd {
  margin: 0.25rem 0 0;
  color: #334155;
  font-weight: 700;
}

.incident-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 0.75rem;
}

.incident-card__footer small {
  color: #64748b;
  font-weight: 700;
}

.incident-card__button {
  border: none;
  border-radius: 12px;
  background: #4f46e5;
  color: #ffffff;
  cursor: pointer;
  font-weight: 800;
  padding: 0.625rem 0.875rem;
}

.incident-card__button:hover {
  background: #4338ca;
}

@media (max-width: 767px) {
  .incident-card__header,
  .incident-card__footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .incident-card__meta {
    grid-template-columns: 1fr;
  }
}
</style>