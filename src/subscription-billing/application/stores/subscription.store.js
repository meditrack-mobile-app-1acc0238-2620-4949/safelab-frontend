import { defineStore } from 'pinia'
import { SubscriptionApiService } from '../../infrastructure/http/subscription-api.service'

const subscriptionApiService = new SubscriptionApiService()

export const useSubscriptionStore = defineStore('subscription-billing', {
    state: () => ({
        subscription: null,
        plans: [],
        invoices: [],
        payments: [],
        usageLimits: null,
        loading: false,
        error: null
    }),

    getters: {
        currentPlan(state) {
            if (!state.subscription) return null

            return state.plans.find(
                (plan) => Number(plan.id) === Number(state.subscription.currentPlanId)
            )
        },

        latestInvoice(state) {
            return [...state.invoices]
                .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0]
        },

        deviceUsagePercentage(state) {
            if (!state.subscription) return 0

            const used = Number(state.subscription.devicesUsed || 0)
            const limit = Number(state.subscription.devicesLimit || 1)

            return Math.min(Math.round((used / limit) * 100), 100)
        },

        paidInvoices(state) {
            return state.invoices.filter((invoice) => invoice.status === 'paid')
        },

        pendingInvoices(state) {
            return state.invoices.filter((invoice) => invoice.status === 'pending')
        }
    },

    actions: {
        async loadBillingData() {
            this.loading = true
            this.error = null

            try {
                const [
                    subscriptionResponse,
                    plansResponse,
                    invoicesResponse,
                    paymentsResponse,
                    usageLimitsResponse
                ] = await Promise.all([
                    subscriptionApiService.getSubscription(),
                    subscriptionApiService.getPlans(),
                    subscriptionApiService.getInvoices(),
                    subscriptionApiService.getPayments(),
                    subscriptionApiService.getUsageLimits()
                ])

                this.subscription = subscriptionResponse.data
                this.plans = plansResponse.data
                this.invoices = invoicesResponse.data
                this.payments = paymentsResponse.data
                this.usageLimits = usageLimitsResponse.data
            } catch (error) {
                console.error(error)
                this.error = 'Could not load billing data.'
            } finally {
                this.loading = false
            }
        },

        async selectPlan(plan) {
            this.loading = true
            this.error = null

            try {
                const response = await subscriptionApiService.updateSubscription({
                    currentPlanId: plan.id,
                    planName: plan.name,
                    monthlyCost: plan.monthlyCost,
                    devicesLimit: plan.deviceLimit,
                    reportsLimit: plan.reportsLimit,
                    alertsLimit: plan.alertsLimit,
                    updatedAt: new Date().toISOString()
                })

                this.subscription = response.data
            } catch (error) {
                console.error(error)
                this.error = 'Could not update subscription plan.'
            } finally {
                this.loading = false
            }
        }
    }
})