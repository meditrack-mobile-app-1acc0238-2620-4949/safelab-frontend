export class Notification {
    constructor({
                    id,
                    alertId = null,
                    recipientId = null,
                    title = '',
                    message = '',
                    source = 'SafeLab',
                    severity = 'info',
                    channel = 'in-app',
                    status = 'delivered',
                    createdAt = null,
                    sentAt = null,
                    deliveredAt = null,
                    readAt = null,
                    retryCount = 0
                }) {
        this.id = id
        this.alertId = alertId
        this.recipientId = recipientId
        this.title = title
        this.message = message
        this.source = source
        this.severity = severity
        this.channel = channel
        this.status = status
        this.createdAt = createdAt
        this.sentAt = sentAt
        this.deliveredAt = deliveredAt
        this.readAt = readAt
        this.retryCount = retryCount
    }

    get isUnread() {
        return !this.readAt
    }
}