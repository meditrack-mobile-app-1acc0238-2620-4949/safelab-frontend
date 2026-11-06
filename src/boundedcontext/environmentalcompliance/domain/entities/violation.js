import { assertDate, assertEnum, assertString } from './validators'
import { ViolationSeverity } from '../models/violation-severity'
import { ViolationStatus } from '../models/violation-status'

export class Violation {
  constructor({ id, description, severity = ViolationSeverity.High, detectedAt, status = ViolationStatus.Open }) {
    assertString(id, 'Violation.id')
    assertString(description, 'Violation.description')
    assertEnum(severity, ViolationSeverity, 'Violation.severity')
    assertDate(detectedAt, 'Violation.detectedAt')
    assertEnum(status, ViolationStatus, 'Violation.status')

    this.id = id
    this.description = description
    this.severity = severity
    this.detectedAt = detectedAt
    this.status = status
  }

  markAsResolved() {
    this.status = ViolationStatus.Resolved
  }

  escalate() {
    this.status = ViolationStatus.Escalated
  }
}

