import { defineStore } from 'pinia'
import { fetchComplianceSensors } from '../services'
import { filterRecordsForCurrentUser } from '@/shared/application/services/role-data-filter.service'

const buildRuleKey = (type, minValue, maxValue) => `${type}:${minValue}:${maxValue}`

const isValidNumber = (value) => typeof value === 'number' && !Number.isNaN(value)

const isOutOfRange = (value, minValue, maxValue) => value < minValue || value > maxValue

const getFirstThreshold = (sensor) => {
    if (!Array.isArray(sensor.thresholds) || sensor.thresholds.length === 0) {
        return null
    }

    return sensor.thresholds[0]
}

const deriveRules = (sensors) => {
    const rulesByKey = new Map()

    sensors.forEach((sensor) => {
        sensor.thresholds.forEach((threshold) => {
            const key = buildRuleKey(sensor.type, threshold.minValue, threshold.maxValue)

            if (!rulesByKey.has(key)) {
                rulesByKey.set(key, {
                    id: key,
                    type: sensor.type,
                    minValue: threshold.minValue,
                    maxValue: threshold.maxValue,
                    sensorCount: 0,
                    violationCount: 0,
                    affectedSensors: []
                })
            }

            const rule = rulesByKey.get(key)
            rule.sensorCount += 1

            if (
                isValidNumber(sensor.value) &&
                isOutOfRange(sensor.value, threshold.minValue, threshold.maxValue)
            ) {
                rule.violationCount += 1
                rule.affectedSensors.push({
                    id: sensor.id,
                    name: sensor.name,
                    code: sensor.code,
                    value: sensor.value
                })
            }
        })
    })

    return Array.from(rulesByKey.values())
}

const deriveViolations = (sensors) => {
    return sensors
        .map((sensor) => {
            const threshold = getFirstThreshold(sensor)

            if (!threshold || !isValidNumber(sensor.value)) {
                return null
            }

            const hasViolation = isOutOfRange(
                sensor.value,
                threshold.minValue,
                threshold.maxValue
            )

            if (!hasViolation) {
                return null
            }

            return {
                id: `${sensor.id}-${sensor.type}`,
                sensorId: sensor.id,
                sensorName: sensor.name,
                sensorCode: sensor.code,
                type: sensor.type,
                value: sensor.value,
                minValue: threshold.minValue,
                maxValue: threshold.maxValue,
                lastReadingAt: sensor.lastReadingAt,
                severity: sensor.value > threshold.maxValue ? 'High' : 'Low'
            }
        })
        .filter(Boolean)
}

const computeKpis = (sensors) => {
    const totalSensors = sensors.length

    const compliantSensors = sensors.filter((sensor) => {
        const threshold = getFirstThreshold(sensor)

        if (!threshold || !isValidNumber(sensor.value)) {
            return true
        }

        return !isOutOfRange(sensor.value, threshold.minValue, threshold.maxValue)
    }).length

    const activeViolations = totalSensors - compliantSensors
    const complianceRate = totalSensors === 0 ? 0 : (compliantSensors / totalSensors) * 100
    const pendingAudits = activeViolations > 0 ? Math.min(activeViolations, 3) : 0

    return {
        totalSensors,
        compliantSensors,
        complianceRate,
        activeViolations,
        pendingAudits
    }
}

const computeEvidenceSummary = (rules, violations) => {
    const totalRules = rules.length
    const compliantRules = rules.filter((rule) => rule.violationCount === 0).length
    const violatedRules = rules.filter((rule) => rule.violationCount > 0).length
    const readinessRate = totalRules === 0 ? 0 : (compliantRules / totalRules) * 100

    return {
        totalRules,
        compliantRules,
        violatedRules,
        readinessRate,
        evidenceReady: compliantRules,
        pendingEvidence: violations.length
    }
}

export const useComplianceStore = defineStore('environmental-compliance', {
    state: () => ({
        sensors: [],
        rules: [],
        violations: [],
        evidenceSummary: {
            totalRules: 0,
            compliantRules: 0,
            violatedRules: 0,
            readinessRate: 0,
            evidenceReady: 0,
            pendingEvidence: 0
        },
        kpis: {
            totalSensors: 0,
            compliantSensors: 0,
            complianceRate: 0,
            activeViolations: 0,
            pendingAudits: 0
        },
        loading: false,
        error: null
    }),

    getters: {
        complianceRules(state) {
            return state.rules
        },

        recentViolations(state) {
            return state.violations.slice(0, 5)
        }
    },

    actions: {
        async loadCompliance() {
            this.loading = true
            this.error = null

            try {
                this.sensors = filterRecordsForCurrentUser(await fetchComplianceSensors())
                this.rules = deriveRules(this.sensors)
                this.violations = deriveViolations(this.sensors)
                this.kpis = computeKpis(this.sensors)
                this.evidenceSummary = computeEvidenceSummary(this.rules, this.violations)
            } catch (error) {
                this.error = error
            } finally {
                this.loading = false
            }
        }
    }
})