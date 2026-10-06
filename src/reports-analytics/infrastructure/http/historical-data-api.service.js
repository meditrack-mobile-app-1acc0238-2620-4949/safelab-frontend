import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://safelab-platform-api.onrender.com/api/v1'
})

export class HistoricalDataApiService {
    getAll(filters = {}) {
        return http.get('/historicalData', {
            params: filters
        })
    }
}