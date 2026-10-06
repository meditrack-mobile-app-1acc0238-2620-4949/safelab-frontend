import { defineStore } from 'pinia'
import { dashboardOverviewService, fallbackOverview } from '@/dashboard-overview/application/services/dashboard-overview.service'

export const useDashboardOverviewStore = defineStore('dashboardOverview', {
  state: () => ({
    overview: dashboardOverviewService.toSummary(fallbackOverview),
    loading: false,
    error: null
  }),
  getters: {
    kpis: state => state.overview?.kpis ?? [],
    widgets: state => state.overview?.widgets ?? [],
    notifications: state => state.overview?.notifications ?? [],
    trends: state => state.overview?.trends ?? [],
    compliance: state => state.overview?.compliance ?? {},
    filters: state => state.overview?.filters ?? [],
    laboratories: state => state.overview?.laboratories ?? [],
    operationalRisks: state => state.overview?.operationalRisks ?? [],
    healthScore: state => state.overview?.healthScore ?? state.overview?.complianceScore ?? 0,
    usesFallbackData: state => Boolean(state.overview?.fallback)
  },
  actions: {
    async loadOverview() {
      this.loading = true
      this.error = null
      try {
        this.overview = await dashboardOverviewService.fetchOverview()
      } catch (error) {
        this.error = error
        this.overview = dashboardOverviewService.toSummary(fallbackOverview)
      } finally {
        this.loading = false
      }
    }
  }
})
