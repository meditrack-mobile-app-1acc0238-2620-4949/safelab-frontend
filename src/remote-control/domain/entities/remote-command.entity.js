export class RemoteCommand {
    constructor({
                    id,
                    actuatorId,
                    actuatorName = '',
                    type = '',
                    requestedBy = '',
                    status = 'pending',
                    createdAt = null,
                    completedAt = null,
                    result = '',
                    notes = ''
                }) {
        this.id = id
        this.actuatorId = actuatorId
        this.actuatorName = actuatorName
        this.type = type
        this.requestedBy = requestedBy
        this.status = status
        this.createdAt = createdAt
        this.completedAt = completedAt
        this.result = result
        this.notes = notes
    }
}