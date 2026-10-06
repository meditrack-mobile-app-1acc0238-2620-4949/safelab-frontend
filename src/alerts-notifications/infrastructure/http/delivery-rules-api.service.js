import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

export class DeliveryRulesApiService {
    getAll() {
        return http.get('/deliveryRules')
    }

    create(payload) {
        return http.post('/deliveryRules', payload)
    }

    update(id, payload) {
        return http.patch(`/deliveryRules/${id}`, payload)
    }

    delete(id) {
        return http.delete(`/deliveryRules/${id}`)
    }
}