import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://safelab-platform-api.onrender.com/api/v1'
})

export class ReportsApiService {
    getAll() {
        return http.get('/reports')
    }

    generate(payload) {
        return http.post('/reports', {
            ...payload,
            status: 'generated',
            createdAt: new Date().toISOString(),
            downloadUrl: '#'
        })
    }

    getById(id) {
        return http.get(`/reports/${id}`)
    }

    download(id) {
        return http.get(`/reports/${id}`)
    }
}