import axios from 'axios'

const http = axios.create({
    baseURL: 'http://localhost:3000'
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