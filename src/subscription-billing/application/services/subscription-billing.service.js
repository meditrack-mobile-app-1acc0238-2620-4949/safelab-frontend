import { SubscriptionBillingApiService } from '../../infrastructure/http/subscription-api.service.js'
import { Plan } from '../../domain/entities/plan.entity'
import { Subscription } from '../../domain/entities/subscription.entity'
import { Invoice } from '../../domain/entities/invoice.entity'
import { Payment } from '../../domain/entities/payment.entity'

const api = new SubscriptionBillingApiService()

const mockPlans = [
  {
    id: 'basic-monitoring',
    name: 'Basic Monitoring',
    description: 'For small laboratories that need essential monitoring and alerts.',
    price: 49,
    billingCycle: 'monthly',
    maxDevices: 10,
    includesReports: true,
    status: 'active'
  },
  {
    id: 'professional-monitoring',
    name: 'Professional Monitoring',
    description: 'For laboratories with several monitored devices and reporting needs.',
    price: 99,
    billingCycle: 'monthly',
    maxDevices: 35,
    includesReports: true,
    status: 'active'
  },
  {
    id: 'enterprise-monitoring',
    name: 'Enterprise Monitoring',
    description: 'For hospitals or pharma companies that manage multiple locations.',
    price: 199,
    billingCycle: 'monthly',
    maxDevices: 100,
    includesReports: true,
    status: 'active'
  }
]

const mockSubscriptions = [
  {
    id: 'sub-001',
    customerName: 'Central Laboratory',
    customerEmail: 'admin@centrallab.com',
    planName: 'Professional Monitoring',
    status: 'active',
    startDate: '2026-04-01',
    renewalDate: '2026-05-01',
    amount: 99,
    devicesUsed: 24,
    devicesLimit: 35
  },
  {
    id: 'sub-002',
    customerName: 'North Hospital',
    customerEmail: 'billing@northhospital.com',
    planName: 'Enterprise Monitoring',
    status: 'trial',
    startDate: '2026-04-10',
    renewalDate: '2026-05-10',
    amount: 199,
    devicesUsed: 62,
    devicesLimit: 100
  },
  {
    id: 'sub-003',
    customerName: 'BioLab Research',
    customerEmail: 'finance@biolab.com',
    planName: 'Basic Monitoring',
    status: 'past_due',
    startDate: '2026-03-15',
    renewalDate: '2026-04-15',
    amount: 49,
    devicesUsed: 9,
    devicesLimit: 10
  }
]

const mockInvoices = [
  {
    id: 'inv-001',
    number: 'INV-2026-001',
    customerName: 'Central Laboratory',
    planName: 'Professional Monitoring',
    issueDate: '2026-04-01',
    dueDate: '2026-04-10',
    amount: 99,
    status: 'paid'
  },
  {
    id: 'inv-002',
    number: 'INV-2026-002',
    customerName: 'North Hospital',
    planName: 'Enterprise Monitoring',
    issueDate: '2026-04-10',
    dueDate: '2026-04-20',
    amount: 199,
    status: 'pending'
  },
  {
    id: 'inv-003',
    number: 'INV-2026-003',
    customerName: 'BioLab Research',
    planName: 'Basic Monitoring',
    issueDate: '2026-04-15',
    dueDate: '2026-04-25',
    amount: 49,
    status: 'overdue'
  }
]

const mockPayments = [
  {
    id: 'pay-001',
    customerName: 'Central Laboratory',
    invoiceNumber: 'INV-2026-001',
    paymentDate: '2026-04-08',
    method: 'Credit card',
    amount: 99,
    status: 'successful'
  },
  {
    id: 'pay-002',
    customerName: 'North Hospital',
    invoiceNumber: 'INV-2026-002',
    paymentDate: 'Pending',
    method: 'Bank transfer',
    amount: 199,
    status: 'pending'
  },
  {
    id: 'pay-003',
    customerName: 'BioLab Research',
    invoiceNumber: 'INV-2026-003',
    paymentDate: '2026-04-22',
    method: 'Credit card',
    amount: 49,
    status: 'failed'
  }
]

function mapRecords(records, Entity) {
  return records.map((record) => new Entity(record))
}

export class SubscriptionBillingService {
  async findPlans() {
    try {
      const response = await api.getPlans()
      return mapRecords(response.data, Plan)
    } catch {
      return mapRecords(mockPlans, Plan)
    }
  }

  async findSubscriptions() {
    try {
      const response = await api.getSubscriptions()
      return mapRecords(response.data, Subscription)
    } catch {
      return mapRecords(mockSubscriptions, Subscription)
    }
  }

  async findInvoices() {
    try {
      const response = await api.getInvoices()
      return mapRecords(response.data, Invoice)
    } catch {
      return mapRecords(mockInvoices, Invoice)
    }
  }

  async findPayments() {
    try {
      const response = await api.getPayments()
      return mapRecords(response.data, Payment)
    } catch {
      return mapRecords(mockPayments, Payment)
    }
  }
}
