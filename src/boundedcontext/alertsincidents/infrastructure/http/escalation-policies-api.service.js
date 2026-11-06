import axios from 'axios'

const http = axios.create({
    baseURL: 'http://localhost:3000'
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