import { defineStore } from 'pinia'
import { AuditTraceabilityService, fallbackAuditTraceability } from '@/audit-traceability/application/services/audit-traceability.service'

const service = new AuditTraceabilityService()

export const useAuditTraceabilityStore = defineStore('auditTraceability', {
  state: () => ({
    overview: fallbackAuditTraceability,
    loading: false,
    error: null,
    selectedStatus: 'all',
    selectedSeverity: 'all',
    searchTerm: ''
  }),
  getters: {
    summary: (state) => state.overview.summary,
    filteredLogs: (state) => {
      const query = state.searchTerm.trim().toLowerCase()
      return state.overview.auditLogs.filter((log) => {
        const matchesQuery = !query || [log.id, log.actor, log.action, log.module, log.evidenceId]
          .join(' ')
          .toLowerCase()
          .includes(query)
        const matchesStatus = state.selectedStatus === 'all' || log.status === state.selectedStatus
        const matchesSeverity = state.selectedSeverity === 'all' || log.severity === state.selectedSeverity
        return matchesQuery && matchesStatus && matchesSeverity
      })
    }
  },
  actions: {
    async loadOverview() {
      this.loading = true
      this.error = null
      try {
        this.overview = await service.getOverview()
      } catch (error) {
        this.error = 'audit.errors.load'
        this.overview = fallbackAuditTraceability
      } finally {
        this.loading = false
      }
    },
    setSearchTerm(value) {
      this.searchTerm = value
    },
    setStatus(value) {
      this.selectedStatus = value
    },
    setSeverity(value) {
      this.selectedSeverity = value
    }
  }
})
