import { apiClient } from '@/shared/infrastructure/http/api-client'

export class UserProfileApiService {
  getProfileByAccountId(accountId) {
    return apiClient.get(`/userprofiles/users/${accountId}`)
  }

  updateProfile(id, payload) {
    return apiClient.patch(`/userprofiles/users/${id}`, payload)
  }

  updateUser(accountId, payload) {
    return apiClient.patch(`/userprofiles/users/${accountId}`, payload)
  }
}
