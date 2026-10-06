import { RemoteControlApiService } from '../../infrastructure/http/remote-control-api.service'
import { RemoteActuator } from '../../domain/entities/remote-actuator.entity'
import { RemoteCommand } from '../../domain/entities/remote-command.entity'

const api = new RemoteControlApiService()

export class RemoteControlService {
    async findActuators() {
        const response = await api.getActuators()
        return response.data.map((item) => new RemoteActuator(item))
    }

    async findCommands() {
        const response = await api.getCommands()
        return response.data.map((item) => new RemoteCommand(item))
    }

    async findPolicies() {
        const response = await api.getPolicies()
        return response.data
    }

    async executeCommand(actuator, commandType, requestedBy) {
        const now = new Date().toISOString()

        const commandPayload = {
            actuatorId: actuator.id,
            actuatorName: actuator.name,
            type: commandType,
            requestedBy,
            status: 'completed',
            createdAt: now,
            completedAt: now,
            result: 'Command simulated successfully',
            notes: 'Remote command executed in SafeLab simulation environment.'
        }

        const commandResponse = await api.createCommand(commandPayload)

        await api.updateActuator(actuator.id, {
            commandStatus: 'completed',
            lastCommand: commandType,
            lastCommandAt: now
        })

        return new RemoteCommand(commandResponse.data)
    }
}