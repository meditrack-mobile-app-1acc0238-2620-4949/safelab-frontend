import { assertArray, assertDate, assertEnum, assertString } from './validators'
import { SensorStatus } from '../models/sensor-status'
import { SensorType } from '../models/sensor-type'

export class Sensor {
  constructor({
    id,
    code,
    name,
    type,
    status = SensorStatus.Active,
    installedAt = new Date(),
    thresholds = [],
    calibrations = []
  }) {
    assertString(id, 'Sensor.id')
    assertString(code, 'Sensor.code')
    assertString(name, 'Sensor.name')
    assertEnum(type, SensorType, 'Sensor.type')
    assertEnum(status, SensorStatus, 'Sensor.status')
    assertDate(installedAt, 'Sensor.installedAt')
    assertArray(thresholds, 'Sensor.thresholds')
    assertArray(calibrations, 'Sensor.calibrations')

    this.id = id
    this.code = code
    this.name = name
    this.type = type
    this.status = status
    this.installedAt = installedAt
    this.thresholds = thresholds
    this.calibrations = calibrations
  }

  activate() {
    this.status = SensorStatus.Active
  }

  deactivate() {
    this.status = SensorStatus.Inactive
  }

  markAsDisconnected() {
    this.status = SensorStatus.Disconnected
  }
}

