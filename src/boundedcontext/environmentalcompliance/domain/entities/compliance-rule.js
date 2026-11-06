import { assertEnum, assertString } from './validators'
import { ComplianceRuleStatus } from '../models/compliance-rule-status'
import { ComplianceRuleType } from '../models/compliance-rule-type'

export class ComplianceRule {
  constructor({ id, name, description, type, status = ComplianceRuleStatus.Active }) {
    assertString(id, 'ComplianceRule.id')
    assertString(name, 'ComplianceRule.name')
    assertString(description, 'ComplianceRule.description')
    assertEnum(type, ComplianceRuleType, 'ComplianceRule.type')
    assertEnum(status, ComplianceRuleStatus, 'ComplianceRule.status')

    this.id = id
    this.name = name
    this.description = description
    this.type = type
    this.status = status
  }

  activate() {
    this.status = ComplianceRuleStatus.Active
  }

  deactivate() {
    this.status = ComplianceRuleStatus.Inactive
  }

  updateDescription(description) {
    assertString(description, 'ComplianceRule.description')
    this.description = description
  }
}

