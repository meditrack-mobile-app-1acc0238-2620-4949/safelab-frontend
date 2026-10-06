import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://safelab-platform-api.onrender.com/api/v1'
})

export class SubscriptionApiService {
    getSubscription() {
        return http.get('/subscriptions/1')
    }

    updateSubscription(payload) {
        return http.patch('/subscriptions/1', payload)
    }

    getPlans() {
        return http.get('/billingPlans')
    }

    getInvoices() {
        return http.get('/invoices')
    }

    getPayments() {
        return http.get('/payments')
    }

    getUsageLimits() {
        return http.get('/usageLimits/1')
    }
}