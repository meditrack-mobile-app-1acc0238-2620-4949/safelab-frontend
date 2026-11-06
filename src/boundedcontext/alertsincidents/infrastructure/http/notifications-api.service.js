import axios from 'axios'

const http = axios.create({
    baseURL: 'http://localhost:3000'
})

export class NotificationsApiService {
    getAll() {
        return http.get('/notifications')
    }

    getById(id) {
        return http.get(`/notifications/${id}`)
    }

    create(payload) {
        return http.post('/notifications', payload)
    }

    markAsRead(id) {
        return http.patch(`/notifications/${id}`, {
            readAt: new Date().toISOString()
        })
    }

    retry(id) {
        return http.patch(`/notifications/${id}`, {
            status: 'pending',
            retryCount: 0
        })
    }
}