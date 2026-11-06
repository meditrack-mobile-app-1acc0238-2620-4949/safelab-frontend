import { InvoiceStatus } from '../models/invoice-status.enum'

export class Invoice {
  constructor({
    id = null,
    number = '',
    customerName = '',
    planName = '',
    issueDate = '',
    dueDate = '',
    amount = 0,
    status = InvoiceStatus.PENDING
  } = {}) {
    this.id = id
    this.number = number
    this.customerName = customerName
    this.planName = planName
    this.issueDate = issueDate
    this.dueDate = dueDate
    this.amount = amount
    this.status = status
  }
}
