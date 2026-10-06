import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

export class RecipientsApiService {
    getAll() {
        return http.get('/recipients')
    }

    getById(id) {
        return http.get(`/recipients/${id}`)
    }
}