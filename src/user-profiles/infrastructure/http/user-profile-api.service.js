import { apiClient } from '@/shared/infrastructure/http/api-client'

export class UserProfileApiService {
  getProfileByAccountId(accountId) {
    return apiClient.get(`/user-profiles/users/${accountId}`)
  }

  updateProfile(id, payload) {
    return apiClient.patch(`/user-profiles/users/${id}`, payload)
  }

  updateUser(accountId, payload) {
    return apiClient.patch(`/user-profiles/users/${accountId}`, payload)
  }
}
