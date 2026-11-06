import { SubscriptionStatus } from '../models/subscription-status.enum'

export class Subscription {
  constructor({
    id = null,
    customerName = '',
    customerEmail = '',
    planName = '',
    status = SubscriptionStatus.ACTIVE,
    startDate = '',
    renewalDate = '',
    amount = 0,
    devicesUsed = 0,
    devicesLimit = 0
  } = {}) {
    this.id = id
    this.customerName = customerName
    this.customerEmail = customerEmail
    this.planName = planName
    this.status = status
    this.startDate = startDate
    this.renewalDate = renewalDate
    this.amount = amount
    this.devicesUsed = devicesUsed
    this.devicesLimit = devicesLimit
  }
}
