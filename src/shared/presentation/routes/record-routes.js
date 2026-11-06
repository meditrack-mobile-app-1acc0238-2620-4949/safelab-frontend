import FullRecordsView from '@/shared/presentation/views/FullRecordsView.vue'

// Each route keeps its owning Bounded Context, even though the table UI is shared.
const contexts = [
  'dashboardinsights', 'facilityassets', 'equipmentmaintenance',
  'sensormonitoring', 'environmentalcompliance', 'alertsincidents',
  'remoteactuation', 'reportinganalytics', 'audittraceability',
  'subscriptionbilling'
]

export const recordRoutes = contexts.map((context) => ({
  path: `${context}/records/:dataset`,
  name: `${context}-full-records`,
  component: FullRecordsView,
  meta: {
    titleKey: 'records.fullRecords',
    sidebarContext: context,
    contextKey: context,
  }
}))
