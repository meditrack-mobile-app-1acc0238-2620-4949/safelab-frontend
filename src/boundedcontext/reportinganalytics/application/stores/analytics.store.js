import { defineStore } from 'pinia'
import { AnalyticsService } from '../services/analytics.service'

const analyticsService = new AnalyticsService()

export const useAnalyticsStore = defineStore('reportsAnalytics', {
    state: () => ({
        dashboard: {
            summary: {
                totalReports: 0,
                generatedReports: 0,
                totalAlerts: 0,
                activeAlerts: 0,
                criticalAlerts: 0,
                warningAlerts: 0,
                totalSensors: 0,
                totalAssets: 0,
                averageTemperature: null,
                averageHumidity: null,
                complianceScore: 0,
                disconnectedSensors: 0,
                outOfRangeSensors: 0,
                operationalRisk: 0
            },
            alertsBySeverity: {},
            reportsByFormat: {},
            recentReports: [],
            recentAlerts: [],
            trends: []
        },
        loading: false,
        error: null
    }),

    getters: {
        summary(state) {
            return state.dashboard.summary
        },

        trends(state) {
            return state.dashboard.trends
        },

        recentReports(state) {
            return state.dashboard.recentReports
        },

        recentAlerts(state) {
            return state.dashboard.recentAlerts
        }
    },

    actions: {
        async fetchAnalytics() {
            this.loading = true
            this.error = null

            try {
                this.dashboard = await analyticsService.getDashboard()
            } catch (error) {
                console.error(error)
                this.error = 'Could not load analytics.'
            } finally {
                this.loading = false
            }
        }
    }
})