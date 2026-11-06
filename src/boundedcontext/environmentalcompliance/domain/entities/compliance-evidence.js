import { assertDate, assertEnum, assertString } from './validators'
import { EvidenceType } from '../models/evidence-type'

export class ComplianceEvidence {
  constructor({ id, evidenceUrl, type, createdAt }) {
    assertString(id, 'ComplianceEvidence.id')
    assertString(evidenceUrl, 'ComplianceEvidence.evidenceUrl')
    assertEnum(type, EvidenceType, 'ComplianceEvidence.type')
    assertDate(createdAt, 'ComplianceEvidence.createdAt')

    this.id = id
    this.evidenceUrl = evidenceUrl
    this.type = type
    this.createdAt = createdAt
    this.isAttached = true
  }

  attach() {
    this.isAttached = true
  }

  remove() {
    this.isAttached = false
  }
}

