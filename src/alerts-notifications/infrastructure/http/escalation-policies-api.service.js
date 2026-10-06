import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

export class EscalationPoliciesApiService {
    getAll() {
        return http.get('/escalationPolicies')
    }

    create(payload) {
        return http.post('/escalationPolicies', payload)
    }

    update(id, payload) {
        return http.patch(`/escalationPolicies/${id}`, payload)
    }

    delete(id) {
        return http.delete(`/escalationPolicies/${id}`)
    }
}