import { apiClient } from '@/shared/infrastructure/http/api-client'

export class IdentityAccessApiService {
  signIn(payload) {
    return apiClient.post('/auth/sign-in', payload)
  }

  signOut() {
    return apiClient.post('/auth/sign-out')
  }

  getCurrentUser() {
    return apiClient.get('/auth/me')
  }

  getUsers() {
    return apiClient.get('/userprofiles/users')
  }

  createUser(payload) {
    return apiClient.post('/users', payload)
  }

  createUserProfile(payload) {
    return Promise.resolve({ data: payload })
  }

  createUserSubscription(payload) {
    return Promise.resolve({ data: payload })
  }

  getBillingPlans() {
    return apiClient.get('/subscriptionbilling/billing')
  }
}
