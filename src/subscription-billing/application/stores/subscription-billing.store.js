import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { SubscriptionBillingService } from '../services/subscription-billing.service'

const service = new SubscriptionBillingService()

function normalize(value) {
  return String(value || '').toLowerCase()
}

export const useSubscriptionBillingStore = defineStore('subscription-billing', () => {
  const plans = ref([])
  const subscriptions = ref([])
  const invoices = ref([])
  const payments = ref([])
  const loading = ref(false)
  const error = ref(null)

  const filters = ref({
    query: '',
    status: ''
  })

  const activeSubscriptions = computed(() =>
    subscriptions.value.filter((subscription) => subscription.status === 'active')
  )

  const pastDueSubscriptions = computed(() =>
    subscriptions.value.filter((subscription) => subscription.status === 'past_due')
  )

  const monthlyRevenue = computed(() =>
    activeSubscriptions.value.reduce((total, subscription) => total + Number(subscription.amount || 0), 0)
  )

  const pendingInvoices = computed(() =>
    invoices.value.filter((invoice) => invoice.status !== 'paid')
  )

  const filteredSubscriptions = computed(() => {
    const query = normalize(filters.value.query)

    return subscriptions.value.filter((subscription) => {
      const matchesQuery =
        !query ||
        normalize(subscription.customerName).includes(query) ||
        normalize(subscription.customerEmail).includes(query) ||
        normalize(subscription.planName).includes(query)

      const matchesStatus = !filters.value.status || subscription.status === filters.value.status

      return matchesQuery && matchesStatus
    })
  })

  const filteredInvoices = computed(() => {
    const query = normalize(filters.value.query)

    return invoices.value.filter((invoice) => {
      const matchesQuery =
        !query ||
        normalize(invoice.number).includes(query) ||
        normalize(invoice.customerName).includes(query) ||
        normalize(invoice.planName).includes(query)

      const matchesStatus = !filters.value.status || invoice.status === filters.value.status

      return matchesQuery && matchesStatus
    })
  })

  function setFilters(newFilters) {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
  }

  function clearFilters() {
    filters.value = {
      query: '',
      status: ''
    }
  }

  async function fetchBillingSummary() {
    loading.value = true
    error.value = null

    try {
      const [plansData, subscriptionsData, invoicesData, paymentsData] = await Promise.all([
        service.findPlans(),
        service.findSubscriptions(),
        service.findInvoices(),
        service.findPayments()
      ])

      plans.value = plansData
      subscriptions.value = subscriptionsData
      invoices.value = invoicesData
      payments.value = paymentsData
    } catch (exception) {
      console.error(exception)
      error.value = 'Could not load subscription billing information.'
    } finally {
      loading.value = false
    }
  }

  return {
    plans,
    subscriptions,
    invoices,
    payments,
    loading,
    error,
    filters,
    activeSubscriptions,
    pastDueSubscriptions,
    monthlyRevenue,
    pendingInvoices,
    filteredSubscriptions,
    filteredInvoices,
    setFilters,
    clearFilters,
    fetchBillingSummary
  }
})
