import axios from 'axios'

const http = axios.create({
    baseURL: 'http://localhost:3000'
})

export class RecipientsApiService {
    getAll() {
        return http.get('/recipients')
    }

    getById(id) {
        return http.get(`/recipients/${id}`)
    }
}