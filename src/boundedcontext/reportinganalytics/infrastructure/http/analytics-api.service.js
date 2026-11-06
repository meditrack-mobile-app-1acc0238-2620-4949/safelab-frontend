import axios from 'axios'

const http = axios.create({
    baseURL: 'http://localhost:3000'
})

export class AnalyticsApiService {
    getSensors() {
        return http.get('/sensors')
    }

    getAlerts() {
        return http.get('/alerts')
    }

    getAssets() {
        return http.get('/assets')
    }

    getReports() {
        return http.get('/reports')
    }
}