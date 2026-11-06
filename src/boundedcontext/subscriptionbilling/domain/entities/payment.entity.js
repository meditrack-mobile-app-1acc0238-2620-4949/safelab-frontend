import { PaymentStatus } from '../models/payment-status.enum'

export class Payment {
  constructor({
    id = null,
    customerName = '',
    invoiceNumber = '',
    paymentDate = '',
    method = '',
    amount = 0,
    status = PaymentStatus.PENDING
  } = {}) {
    this.id = id
    this.customerName = customerName
    this.invoiceNumber = invoiceNumber
    this.paymentDate = paymentDate
    this.method = method
    this.amount = amount
    this.status = status
  }
}
