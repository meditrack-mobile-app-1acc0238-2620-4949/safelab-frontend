import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'
import LiveReadingsView from './views/LiveReadingsView.vue'

export const routes = [
  {
    path: 'sensor-monitoring',
    name: 'sensor-monitoring',
    redirect: { name: 'sensor-monitoring-live-readings' },
    meta: { title: 'Sensor Monitoring', contextKey: 'sensors' }
  },
  {
    path: 'sensor-monitoring/sensor-list',
    name: 'sensor-monitoring-sensor-list',
    component: ComingSoonView,
    meta: { title: 'Sensor List', contextKey: 'sensors', viewKey: 'sensors.SensorList' }
  },
  {
    path: 'sensor-monitoring/sensor-detail',
    name: 'sensor-monitoring-sensor-detail',
    component: ComingSoonView,
    meta: { title: 'Sensor Detail', contextKey: 'sensors', viewKey: 'sensors.SensorDetail' }
  },
  {
    path: 'sensor-monitoring/live-readings',
    name: 'sensor-monitoring-live-readings',
    component: LiveReadingsView,
    meta: { title: 'Live Readings', contextKey: 'sensors', viewKey: 'sensors.LiveReadings' }
  },
  {
    path: 'sensor-monitoring/sensor-status',
    name: 'sensor-monitoring-sensor-status',
    component: ComingSoonView,
    meta: { title: 'Sensor Status', contextKey: 'sensors', viewKey: 'sensors.SensorStatus' }
  },
  {
    path: 'sensor-monitoring/threshold-settings',
    name: 'sensor-monitoring-threshold-settings',
    component: ComingSoonView,
    meta: { title: 'Threshold Settings', contextKey: 'sensors', viewKey: 'sensors.ThresholdSettings' }
  },
  {
    path: 'sensor-monitoring/telemetry-history',
    name: 'sensor-monitoring-telemetry-history',
    component: ComingSoonView,
    meta: { title: 'Telemetry History', contextKey: 'sensors', viewKey: 'sensors.TelemetryHistory' }
  },
  {
    path: 'sensor-monitoring/calibration-history',
    name: 'sensor-monitoring-calibration-history',
    component: ComingSoonView,
    meta: { title: 'Calibration History', contextKey: 'sensors', viewKey: 'sensors.CalibrationHistory' }
  },
  {
    path: 'sensor-monitoring/monitoring-dashboard',
    name: 'sensor-monitoring-monitoring-dashboard',
    component: ComingSoonView,
    meta: { title: 'Monitoring Dashboard', contextKey: 'sensors', viewKey: 'sensors.MonitoringDashboard' }
  },
]
