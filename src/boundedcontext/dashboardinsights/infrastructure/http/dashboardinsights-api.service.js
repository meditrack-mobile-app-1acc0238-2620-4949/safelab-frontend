import { apiClient } from '@/shared/infrastructure/http/api-client'

export class DashboardOverviewApiService {
  async getDashboardOverview(facilityId = 'global') {
    const { data } = await apiClient.get('/dashboard/overview', { params: { facilityId } })
    return data
  }

  async refreshDashboard(facilityId = 'global') {
    const { data } = await apiClient.post('/dashboard/refresh', null, { params: { facilityId } })
    return data
  }
}
