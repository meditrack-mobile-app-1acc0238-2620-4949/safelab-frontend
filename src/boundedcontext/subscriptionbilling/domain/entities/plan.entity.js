import { PlanStatus } from '../models/plan-status.enum'

export class Plan {
  constructor({
    id = null,
    name = '',
    description = '',
    price = 0,
    billingCycle = 'monthly',
    maxDevices = 0,
    includesReports = false,
    status = PlanStatus.ACTIVE
  } = {}) {
    this.id = id
    this.name = name
    this.description = description
    this.price = price
    this.billingCycle = billingCycle
    this.maxDevices = maxDevices
    this.includesReports = includesReports
    this.status = status
  }
}
