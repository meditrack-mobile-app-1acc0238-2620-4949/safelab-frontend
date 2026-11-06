import axios from 'axios'

const http = axios.create({
    baseURL: 'http://localhost:3000'
})

export class AlertsApiService {
    getAll() {
        return http.get('/alerts')
    }

    getById(id) {
        return http.get(`/alerts/${id}`)
    }

    update(id, payload) {
        return http.patch(`/alerts/${id}`, payload)
    }

    acknowledge(id) {
        return this.update(id, {
            status: 'acknowledged',
            acknowledgedAt: new Date().toISOString()
        })
    }

    resolve(id) {
        return this.update(id, {
            status: 'resolved',
            resolvedAt: new Date().toISOString()
        })
    }

    escalate(id) {
        return this.update(id, {
            status: 'escalated',
            escalatedAt: new Date().toISOString()
        })
    }
}