import { defineStore } from 'pinia'
import { IncidentService } from '../services/incident.service'
import { IncidentSeverity, IncidentStatus } from '../../domain/model/incident-status.model'
import { filterRecordsForCurrentUser } from '@/shared/application/services/role-data-filter.service'

const incidentService = new IncidentService()

export const useIncidentStore = defineStore('incident', {
    state: () => ({
        incidents: [],
        selectedIncident: null,
        loading: false,
        error: null
    }),

    getters: {
        openIncidents: (state) =>
            state.incidents.filter((incident) => incident.status === IncidentStatus.OPEN),

        investigatingIncidents: (state) =>
            state.incidents.filter((incident) => incident.status === IncidentStatus.INVESTIGATING),

        resolvedIncidents: (state) =>
            state.incidents.filter((incident) => incident.status === IncidentStatus.RESOLVED),

        criticalIncidents: (state) =>
            state.incidents.filter((incident) => incident.severity === IncidentSeverity.CRITICAL),

        totalIncidents: (state) => state.incidents.length,

        pendingIncidents: (state) =>
            state.incidents.filter((incident) =>
                [IncidentStatus.OPEN, IncidentStatus.INVESTIGATING].includes(incident.status)
            ),

        evidenceReadyCount: (state) =>
            state.incidents.filter((incident) => Number(incident.evidenceCount) > 0).length
    },

    actions: {
        async fetchIncidents() {
            this.loading = true
            this.error = null

            try {
                this.incidents = filterRecordsForCurrentUser(await incidentService.getIncidents())
            } catch (error) {
                console.error(error)
                this.error = 'Could not load incidents.'
            } finally {
                this.loading = false
            }
        },

        async fetchIncidentById(id) {
            this.loading = true
            this.error = null

            try {
                this.selectedIncident = await incidentService.getIncidentById(id)
            } catch (error) {
                console.error(error)
                this.error = 'Could not load incident detail.'
            } finally {
                this.loading = false
            }
        },

        async createIncident(payload) {
            this.loading = true
            this.error = null

            try {
                const createdIncident = await incidentService.createIncident(payload)
                this.incidents.unshift(createdIncident)
                return createdIncident
            } catch (error) {
                console.error(error)
                this.error = 'Could not create incident.'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateIncident(id, payload) {
            this.loading = true
            this.error = null

            try {
                const updatedIncident = await incidentService.updateIncident(id, payload)

                this.incidents = this.incidents.map((incident) =>
                    String(incident.id) === String(id) ? updatedIncident : incident
                )

                if (String(this.selectedIncident?.id) === String(id)) {
                    this.selectedIncident = updatedIncident
                }

                return updatedIncident
            } catch (error) {
                console.error(error)
                this.error = 'Could not update incident.'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateIncidentStatus(incident, status) {
            this.loading = true
            this.error = null

            try {
                const updatedIncident = await incidentService.updateIncidentStatus(incident, status)

                this.incidents = this.incidents.map((item) =>
                    String(item.id) === String(updatedIncident.id) ? updatedIncident : item
                )

                this.selectedIncident = updatedIncident

                return updatedIncident
            } catch (error) {
                console.error(error)
                this.error = 'Could not update incident status.'
            } finally {
                this.loading = false
            }
        },

        async deleteIncident(id) {
            this.loading = true
            this.error = null

            try {
                await incidentService.deleteIncident(id)

                this.incidents = this.incidents.filter(
                    (incident) => String(incident.id) !== String(id)
                )
            } catch (error) {
                console.error(error)
                this.error = 'Could not delete incident.'
                throw error
            } finally {
                this.loading = false
            }
        },

        clearSelectedIncident() {
            this.selectedIncident = null
        }
    }
})