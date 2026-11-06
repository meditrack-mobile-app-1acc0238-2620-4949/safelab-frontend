import { AnalyticsApiService } from '../../infrastructure/http/analytics-api.service'
import { filterRecordsForCurrentUser } from '@/shared/application/services/role-data-filter.service'

const api = new AnalyticsApiService()

const safeRequest = async (request, fallback = []) => {
    try {
        const response = await request()
        return response.data
    } catch (error) {
        console.warn('Analytics endpoint unavailable:', error?.message)
        return fallback
    }
}

const isNumber = (value) => typeof value === 'number' && !Number.isNaN(value)

const getFirstThreshold = (sensor) => {
    if (!Array.isArray(sensor.thresholds) || sensor.thresholds.length === 0) {
        return null
    }

    return sensor.thresholds[0]
}

const isCompliantSensor = (sensor) => {
    const threshold = getFirstThreshold(sensor)

    if (!threshold || !isNumber(sensor.value)) {
        return true
    }

    return sensor.value >= threshold.minValue && sensor.value <= threshold.maxValue
}

const average = (values) => {
    const validValues = values.filter(isNumber)

    if (validValues.length === 0) {
        return null
    }

    const total = validValues.reduce((sum, value) => sum + value, 0)
    return total / validValues.length
}

const round = (value, decimals = 1) => {
    if (!isNumber(value)) {
        return null
    }

    return Number(value.toFixed(decimals))
}

const countBy = (items, key) => {
    return items.reduce((result, item) => {
        const value = item[key] || 'unknown'
        result[value] = (result[value] || 0) + 1
        return result
    }, {})
}

export class AnalyticsService {
    async getDashboard() {
        const [allSensors, allAlerts, allAssets, allReports] = await Promise.all([
            safeRequest(() => api.getSensors()),
            safeRequest(() => api.getAlerts()),
            safeRequest(() => api.getAssets()),
            safeRequest(() => api.getReports())
        ])

        const sensors = filterRecordsForCurrentUser(allSensors)
        const alerts = filterRecordsForCurrentUser(allAlerts)
        const assets = filterRecordsForCurrentUser(allAssets)
        const reports = filterRecordsForCurrentUser(allReports)

        const temperatureSensors = sensors.filter((sensor) => sensor.type === 'Temperature')
        const humiditySensors = sensors.filter((sensor) => sensor.type === 'Humidity')

        const averageTemperature = round(
            average(temperatureSensors.map((sensor) => sensor.value))
        )

        const averageHumidity = round(
            average(humiditySensors.map((sensor) => sensor.value)),
            0
        )

        const compliantSensors = sensors.filter(isCompliantSensor).length
        const complianceScore = sensors.length === 0
            ? 0
            : round((compliantSensors / sensors.length) * 100)

        const activeAlerts = alerts.filter((alert) => alert.status === 'active').length
        const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical').length
        const warningAlerts = alerts.filter((alert) => alert.severity === 'warning').length
        const generatedReports = reports.filter((report) => report.status === 'generated').length

        const disconnectedSensors = sensors.filter((sensor) =>
            sensor.sensorStatus === 'Disconnected' || sensor.status === 'Invalid'
        ).length

        const outOfRangeSensors = sensors.filter((sensor) => sensor.status === 'OutOfRange').length

        const operationalRisk =
            criticalAlerts +
            outOfRangeSensors +
            disconnectedSensors

        const alertsBySeverity = countBy(alerts, 'severity')
        const reportsByFormat = countBy(reports, 'format')

        const recentReports = [...reports]
            .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
            .slice(0, 4)

        const recentAlerts = [...alerts]
            .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
            .slice(0, 4)

        const trends = [
            {
                id: 'avg-temperature',
                label: 'Average temperature',
                value: averageTemperature ?? 0,
                helper: 'Current monitored temperature average',
                unit: '°C',
                direction: 'stable'
            },
            {
                id: 'avg-humidity',
                label: 'Average humidity',
                value: averageHumidity ?? 0,
                helper: 'Current monitored humidity average',
                unit: '%',
                direction: 'stable'
            },
            {
                id: 'compliance-score',
                label: 'Compliance score',
                value: complianceScore,
                helper: 'Sensors within configured ranges',
                unit: '%',
                direction: complianceScore >= 80 ? 'up' : 'down'
            },
            {
                id: 'active-alerts',
                label: 'Active alerts',
                value: activeAlerts,
                helper: 'Alerts still requiring review',
                unit: '',
                direction: activeAlerts > 0 ? 'down' : 'stable'
            }
        ]

        return {
            summary: {
                totalReports: reports.length,
                generatedReports,
                totalAlerts: alerts.length,
                activeAlerts,
                criticalAlerts,
                warningAlerts,
                totalSensors: sensors.length,
                totalAssets: assets.length,
                averageTemperature,
                averageHumidity,
                complianceScore,
                disconnectedSensors,
                outOfRangeSensors,
                operationalRisk
            },
            alertsBySeverity,
            reportsByFormat,
            recentReports,
            recentAlerts,
            trends
        }
    }
}