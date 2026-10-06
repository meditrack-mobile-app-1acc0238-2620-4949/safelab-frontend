import { apiClient } from '@/shared/infrastructure/http/api-client'

export const fetchSensors = async () => {
  const response = await apiClient.get('/sensors')
  return response.data
}

