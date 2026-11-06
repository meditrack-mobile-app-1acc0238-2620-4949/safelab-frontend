export class AuditLog {
  constructor({ id, actor, action, module, severity, status, ipAddress, createdAt, evidenceId }) {
    this.id = id
    this.actor = actor
    this.action = action
    this.module = module
    this.severity = severity
    this.status = status
    this.ipAddress = ipAddress
    this.createdAt = createdAt
    this.evidenceId = evidenceId
  }

  get isCritical() {
    return this.severity === 'critical'
  }
}
