import { IncidentSeverity, IncidentStatus } from '../model/incident-status.model'

export class Incident {
    constructor({
                    id = null,
                    code = '',
                    title = '',
                    description = '',
                    severity = IncidentSeverity.WARNING,
                    status = IncidentStatus.OPEN,
                    sourceAlertId = null,
                    sourceAlertTitle = '',
                    relatedSensorCode = '',
                    relatedAssetName = '',
                    assignedTo = '',
                    affectedArea = '',
                    priority = 'medium',
                    dueDate = '',
                    correctiveAction = '',
                    resolutionNotes = '',
                    evidenceCount = 0,
                    createdAt = new Date().toISOString(),
                    updatedAt = new Date().toISOString(),
                    timeline = [],
                    ...metadata
                } = {}) {
        this.id = id
        this.code = code
        this.title = title
        this.description = description
        this.severity = severity
        this.status = status
        this.sourceAlertId = sourceAlertId
        this.sourceAlertTitle = sourceAlertTitle
        this.relatedSensorCode = relatedSensorCode
        this.relatedAssetName = relatedAssetName
        this.assignedTo = assignedTo
        this.affectedArea = affectedArea
        this.priority = priority
        this.dueDate = dueDate
        this.correctiveAction = correctiveAction
        this.resolutionNotes = resolutionNotes
        this.evidenceCount = evidenceCount
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.timeline = Array.isArray(timeline) ? timeline : []
        Object.assign(this, metadata)
    }

    get isOpen() {
        return this.status === IncidentStatus.OPEN
    }

    get isInvestigating() {
        return this.status === IncidentStatus.INVESTIGATING
    }

    get isResolved() {
        return this.status === IncidentStatus.RESOLVED
    }

    get isClosed() {
        return this.status === IncidentStatus.CLOSED
    }

    get isCritical() {
        return this.severity === IncidentSeverity.CRITICAL
    }
}