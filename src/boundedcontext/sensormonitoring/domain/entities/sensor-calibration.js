import { assertDate, assertEnum, assertOptionalDate, assertOptionalString, assertString } from './validators'
import { CalibrationStatus } from '../models/calibration-status'

export class SensorCalibration {
  constructor({
    id,
    calibratedAt = null,
    nextCalibrationAt,
    performedBy = null,
    status = CalibrationStatus.Pending
  }) {
    assertString(id, 'SensorCalibration.id')
    assertOptionalDate(calibratedAt, 'SensorCalibration.calibratedAt')
    assertDate(nextCalibrationAt, 'SensorCalibration.nextCalibrationAt')
    assertOptionalString(performedBy, 'SensorCalibration.performedBy')
    assertEnum(status, CalibrationStatus, 'SensorCalibration.status')

    this.id = id
    this.calibratedAt = calibratedAt
    this.nextCalibrationAt = nextCalibrationAt
    this.performedBy = performedBy
    this.status = status
  }

  markAsCompleted() {
    this.status = CalibrationStatus.Completed
  }

  markAsOverdue() {
    this.status = CalibrationStatus.Overdue
  }
}

