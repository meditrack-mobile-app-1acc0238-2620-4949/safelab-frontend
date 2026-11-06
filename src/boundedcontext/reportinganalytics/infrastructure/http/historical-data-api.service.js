import axios from 'axios'

const http = axios.create({
    baseURL: 'http://localhost:3000'
})

export class HistoricalDataApiService {
    getAll(filters = {}) {
        return http.get('/historicalData', {
            params: filters
        })
    }
}