import { defineStore } from 'pinia'
import { ReportService } from '../services/report.service'
import { filterRecordsForCurrentUser } from '@/shared/application/services/role-data-filter.service'

const reportService = new ReportService()

export const useReportStore = defineStore('reportsAnalyticsReports', {
    state: () => ({
        reports: [],
        selectedReport: null,
        loading: false,
        error: null
    }),

    actions: {
        async fetchReports() {
            this.loading = true
            this.error = null

            try {
                this.reports = filterRecordsForCurrentUser(await reportService.findAll())
            } catch (error) {
                console.error(error)
                this.error = 'Could not load reports.'
            } finally {
                this.loading = false
            }
        },

        async generateReport(payload) {
            this.loading = true
            this.error = null

            try {
                await reportService.generate(payload)
                await this.fetchReports()
            } catch (error) {
                console.error(error)
                this.error = 'Could not generate report.'
            } finally {
                this.loading = false
            }
        },

        async downloadReport(id) {
            try {
                return await reportService.download(id)
            } catch (error) {
                console.error(error)
                this.error = 'Could not download report.'
                return null
            }
        }
    }
})
