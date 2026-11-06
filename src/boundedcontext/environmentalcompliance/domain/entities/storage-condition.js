import { assertDate, assertEnum, assertNumber, assertString } from './validators'
import { ConditionStatus } from '../models/condition-status'

export class StorageCondition {
  constructor({ id, temperature, humidity, recordedAt, status = ConditionStatus.Pending }) {
    assertString(id, 'StorageCondition.id')
    assertNumber(temperature, 'StorageCondition.temperature')
    assertNumber(humidity, 'StorageCondition.humidity')
    assertDate(recordedAt, 'StorageCondition.recordedAt')
    assertEnum(status, ConditionStatus, 'StorageCondition.status')

    this.id = id
    this.temperature = temperature
    this.humidity = humidity
    this.recordedAt = recordedAt
    this.status = status
  }

  markAsCompliant() {
    this.status = ConditionStatus.Compliant
  }

  markAsNonCompliant() {
    this.status = ConditionStatus.NonCompliant
  }
}

