export class RemoteActuator {
    constructor({
                    id,
                    name = '',
                    code = '',
                    type = '',
                    location = '',
                    linkedSensorCode = '',
                    status = 'online',
                    safetyState = 'ready',
                    commandStatus = 'idle',
                    lastCommand = null,
                    lastCommandAt = null,
                    supports = []
                }) {
        this.id = id
        this.name = name
        this.code = code
        this.type = type
        this.location = location
        this.linkedSensorCode = linkedSensorCode
        this.status = status
        this.safetyState = safetyState
        this.commandStatus = commandStatus
        this.lastCommand = lastCommand
        this.lastCommandAt = lastCommandAt
        this.supports = supports
    }

    get isAvailable() {
        return this.status === 'online' && this.safetyState === 'ready'
    }
}