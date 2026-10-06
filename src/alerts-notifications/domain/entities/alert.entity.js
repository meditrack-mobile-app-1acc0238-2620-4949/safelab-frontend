import { AlertStatus } from '../models/alert-status.enum';

export class Alert {
    constructor({
                    id,
                    type,
                    title,
                    description,
                    severity,
                    status = AlertStatus.UNACKNOWLEDGED,
                    deviceId,
                    deviceName,
                    location,
                    assignedTo = null,
                    createdAt,
                    acknowledgedAt = null,
                    resolvedAt = null,
                    ...metadata
                }) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.location = location;
        this.assignedTo = assignedTo;
        this.createdAt = createdAt;
        this.acknowledgedAt = acknowledgedAt;
        this.resolvedAt = resolvedAt;
        Object.assign(this, metadata);
    }

    acknowledge() {
        this.status = AlertStatus.ACKNOWLEDGED;
        this.acknowledgedAt = new Date().toISOString();
    }

    resolve() {
        this.status = AlertStatus.RESOLVED;
        this.resolvedAt = new Date().toISOString();
    }

    escalate() {
        this.status = AlertStatus.ESCALATED;
    }
}