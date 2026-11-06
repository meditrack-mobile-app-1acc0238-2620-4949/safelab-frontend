import { apiClient } from '@/shared/infrastructure/http/api-client'

export class AuditTraceabilityApiService {
  async getAuditTraceability() {
    const response = await apiClient.get('/audittraceability/timeline')
    return response.data
  }

  async getAuditLogs() {
    const response = await apiClient.get('/audittraceability/audit-logs')
    return response.data
  }

  async markReviewed(id) {
    const response = await apiClient.post(`/audittraceability/audit-logs/${id}/mark-reviewed`)
    return response.data
  }
}
