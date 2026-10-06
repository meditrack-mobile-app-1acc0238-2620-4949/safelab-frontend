import { assertDate, assertEnum, assertNumber, assertString } from './validators'
import { BatchStatus } from '../models/batch-status'

export class TelemetryBatch {
  constructor({ id, receivedAt, readingCount, status = BatchStatus.Received }) {
    assertString(id, 'TelemetryBatch.id')
    assertDate(receivedAt, 'TelemetryBatch.receivedAt')
    assertNumber(readingCount, 'TelemetryBatch.readingCount')
    assertEnum(status, BatchStatus, 'TelemetryBatch.status')

    this.id = id
    this.receivedAt = receivedAt
    this.readingCount = readingCount
    this.status = status
  }

  process() {
    this.status = BatchStatus.Processed
  }

  reject() {
    this.status = BatchStatus.Rejected
  }
}

