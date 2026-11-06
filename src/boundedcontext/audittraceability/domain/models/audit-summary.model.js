export class AuditSummary {
  constructor({ totalLogs, reviewedLogs, pendingLogs, criticalEvents, integrityScore, retainedDays }) {
    this.totalLogs = totalLogs
    this.reviewedLogs = reviewedLogs
    this.pendingLogs = pendingLogs
    this.criticalEvents = criticalEvents
    this.integrityScore = integrityScore
    this.retainedDays = retainedDays
  }
}
