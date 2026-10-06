import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://safelab-platform-api.onrender.com/api/v1'
})

export class IncidentApiService {
    async getAll() {
        const response = await http.get('/incidents')
        return response.data
    }

    async getById(id) {
        const response = await http.get(`/incidents/${id}`)
        return response.data
    }

    async create(payload) {
        const response = await http.post('/incidents', payload)
        return response.data
    }

    async update(id, payload) {
        const response = await http.patch(`/incidents/${id}`, payload)
        return response.data
    }

    async delete(id) {
        const response = await http.delete(`/incidents/${id}`)
        return response.data
    }
}