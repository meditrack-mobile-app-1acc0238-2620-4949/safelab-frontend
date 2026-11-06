import ComingSoonView from '@/shared/presentation/views/ComingSoonView.vue'
import LiveReadingsView from './views/LiveReadingsView.vue'

export const routes = [
  {
    path: 'sensormonitoring',
    name: 'sensormonitoring',
    redirect: { name: 'sensor-monitoring-live-readings' },
    meta: { title: 'Sensor Monitoring', contextKey: 'sensors' }
  },
  {
    path: 'sensormonitoring/sensor-list',
    name: 'sensor-monitoring-sensor-list',
    component: ComingSoonView,
    meta: { title: 'Sensor List', contextKey: 'sensors', viewKey: 'sensors.SensorList' }
  },
  {
    path: 'sensormonitoring/sensor-detail',
    name: 'sensor-monitoring-sensor-detail',
    component: ComingSoonView,
    meta: { title: 'Sensor Detail', contextKey: 'sensors', viewKey: 'sensors.SensorDetail' }
  },
  {
    path: 'sensormonitoring/live-readings',
    name: 'sensor-monitoring-live-readings',
    component: LiveReadingsView,
    meta: { title: 'Live Readings', contextKey: 'sensors', viewKey: 'sensors.LiveReadings' }
  },
  {
    path: 'sensormonitoring/sensor-status',
    name: 'sensor-monitoring-sensor-status',
    component: ComingSoonView,
    meta: { title: 'Sensor Status', contextKey: 'sensors', viewKey: 'sensors.SensorStatus' }
  },
  {
    path: 'sensormonitoring/threshold-settings',
    name: 'sensor-monitoring-threshold-settings',
    component: ComingSoonView,
    meta: { title: 'Threshold Settings', contextKey: 'sensors', viewKey: 'sensors.ThresholdSettings' }
  },
  {
    path: 'sensormonitoring/telemetry-history',
    name: 'sensor-monitoring-telemetry-history',
    component: ComingSoonView,
    meta: { title: 'Telemetry History', contextKey: 'sensors', viewKey: 'sensors.TelemetryHistory' }
  },
  {
    path: 'sensormonitoring/calibration-history',
    name: 'sensor-monitoring-calibration-history',
    component: ComingSoonView,
    meta: { title: 'Calibration History', contextKey: 'sensors', viewKey: 'sensors.CalibrationHistory' }
  },
  {
    path: 'sensormonitoring/monitoring-dashboard',
    name: 'sensor-monitoring-monitoring-dashboard',
    component: ComingSoonView,
    meta: { title: 'Monitoring Dashboard', contextKey: 'sensors', viewKey: 'sensors.MonitoringDashboard' }
  },
]
