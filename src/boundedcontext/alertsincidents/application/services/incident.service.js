import { IncidentApiService } from '../../infrastructure/http/incident-api.service'
import { Incident } from '../../domain/entities/incident.entity'

const incidentApiService = new IncidentApiService()

export class IncidentService {
    async getIncidents() {
        const incidents = await incidentApiService.getAll()
        return incidents.map((incident) => new Incident(incident))
    }

    async getIncidentById(id) {
        const incident = await incidentApiService.getById(id)
        return new Incident(incident)
    }

    async createIncident(payload) {
        const now = new Date().toISOString()

        const incidentPayload = {
            ...payload,
            createdAt: now,
            updatedAt: now,
            timeline: [
                {
                    id: Date.now(),
                    event: 'Incident created',
                    actor: payload.assignedTo || 'SafeLab System',
                    createdAt: now
                }
            ]
        }

        const incident = await incidentApiService.create(incidentPayload)
        return new Incident(incident)
    }

    async updateIncident(id, payload) {
        const incidentPayload = {
            ...payload,
            updatedAt: new Date().toISOString()
        }

        const incident = await incidentApiService.update(id, incidentPayload)
        return new Incident(incident)
    }

    async updateIncidentStatus(incident, status, actor = 'Dr. Maria Lopez') {
        const now = new Date().toISOString()

        const timelineEntry = {
            id: Date.now(),
            event: `Status changed to ${status}`,
            actor,
            createdAt: now
        }

        const updatedIncident = {
            status,
            updatedAt: now,
            timeline: [
                ...(incident.timeline || []),
                timelineEntry
            ]
        }

        if (status === 'resolved') {
            updatedIncident.resolutionNotes =
                incident.resolutionNotes || 'Incident resolved after operational review.'
        }

        return this.updateIncident(incident.id, updatedIncident)
    }

    async deleteIncident(id) {
        return await incidentApiService.delete(id)
    }
}