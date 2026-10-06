import { defineStore } from 'pinia'
import { RemoteControlService } from '../services/remote-control.service'
import { filterRecordsForCurrentUser } from '@/shared/application/services/role-data-filter.service'

const remoteControlService = new RemoteControlService()

export const useRemoteControlStore = defineStore('remote-control', {
    state: () => ({
        actuators: [],
        commands: [],
        policies: [],
        loading: false,
        executing: false,
        error: null,
        selectedType: 'All'
    }),

    getters: {
        filteredActuators(state) {
            if (state.selectedType === 'All') {
                return state.actuators
            }

            return state.actuators.filter((actuator) => actuator.type === state.selectedType)
        },

        availableActuators(state) {
            return state.actuators.filter((actuator) => actuator.isAvailable)
        },

        blockedActuators(state) {
            return state.actuators.filter((actuator) => !actuator.isAvailable)
        },

        recentCommands(state) {
            return [...state.commands]
                .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
                .slice(0, 6)
        },

        executedToday(state) {
            const today = new Date().toISOString().slice(0, 10)

            return state.commands.filter((command) =>
                String(command.createdAt || '').startsWith(today)
            ).length
        }
    },

    actions: {
        async loadRemoteControl() {
            this.loading = true
            this.error = null

            try {
                const [actuators, commands, policies] = await Promise.all([
                    remoteControlService.findActuators(),
                    remoteControlService.findCommands(),
                    remoteControlService.findPolicies()
                ])

                this.actuators = filterRecordsForCurrentUser(actuators)
                this.commands = filterRecordsForCurrentUser(commands)
                this.policies = policies
            } catch (error) {
                console.error(error)
                this.error = 'Could not load remote control data.'
            } finally {
                this.loading = false
            }
        },

        setSelectedType(type) {
            this.selectedType = type
        },

        async executeCommand(actuator, commandType, requestedBy = 'Dr. Maria Lopez') {
            if (!actuator.isAvailable) {
                this.error = 'The selected device is not available for remote control.'
                return
            }

            this.executing = true
            this.error = null

            try {
                await remoteControlService.executeCommand(actuator, commandType, requestedBy)
                await this.loadRemoteControl()
            } catch (error) {
                console.error(error)
                this.error = 'Could not execute remote command.'
            } finally {
                this.executing = false
            }
        }
    }
})