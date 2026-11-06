import { assertDate, assertEnum, assertNumber, assertString } from './validators'
import { ReadingStatus } from '../models/reading-status'

export class SensorReading {
  constructor({ id, value, unit, recordedAt, status = ReadingStatus.Normal }) {
    assertString(id, 'SensorReading.id')
    assertNumber(value, 'SensorReading.value')
    assertString(unit, 'SensorReading.unit')
    assertDate(recordedAt, 'SensorReading.recordedAt')
    assertEnum(status, ReadingStatus, 'SensorReading.status')

    this.id = id
    this.value = value
    this.unit = unit
    this.recordedAt = recordedAt
    this.status = status
  }

  markAsNormal() {
    this.status = ReadingStatus.Normal
  }

  markAsOutOfRange() {
    this.status = ReadingStatus.OutOfRange
  }
}

