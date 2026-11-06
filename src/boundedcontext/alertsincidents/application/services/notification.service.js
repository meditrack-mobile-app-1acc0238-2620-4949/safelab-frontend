import { NotificationsApiService } from '../../infrastructure/http/notifications-api.service'
import { Notification } from '../../domain/entities/notification.entity'

const api = new NotificationsApiService()

export class NotificationService {
    async findAll() {
        const response = await api.getAll()
        return response.data.map((notification) => new Notification(notification))
    }

    async create(payload) {
        const response = await api.create(payload)
        return new Notification(response.data)
    }

    async markAsRead(id) {
        const response = await api.markAsRead(id)
        return new Notification(response.data)
    }

    async retry(id) {
        const response = await api.retry(id)
        return new Notification(response.data)
    }
}