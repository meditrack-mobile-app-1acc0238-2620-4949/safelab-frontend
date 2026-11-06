import { assertEnum, assertNumber, assertString } from './validators'
import { ThresholdStatus } from '../models/threshold-status'

export class ThresholdRule {
  constructor({ id, minValue, maxValue, unit, status = ThresholdStatus.Active }) {
    assertString(id, 'ThresholdRule.id')
    assertNumber(minValue, 'ThresholdRule.minValue')
    assertNumber(maxValue, 'ThresholdRule.maxValue')
    if (minValue > maxValue) {
      throw new Error('ThresholdRule.minValue must be <= ThresholdRule.maxValue')
    }
    assertString(unit, 'ThresholdRule.unit')
    assertEnum(status, ThresholdStatus, 'ThresholdRule.status')

    this.id = id
    this.minValue = minValue
    this.maxValue = maxValue
    this.unit = unit
    this.status = status
  }

  validate(value) {
    assertNumber(value, 'ThresholdRule.value')
    return value >= this.minValue && value <= this.maxValue
  }

  activate() {
    this.status = ThresholdStatus.Active
  }

  deactivate() {
    this.status = ThresholdStatus.Inactive
  }
}

