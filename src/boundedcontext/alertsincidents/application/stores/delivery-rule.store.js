import { defineStore } from 'pinia'
import { DeliveryRuleService } from '../services/delivery-rule.service'

const deliveryRuleService = new DeliveryRuleService()

export const useDeliveryRuleStore = defineStore('deliveryRules', {
    state: () => ({
        deliveryRules: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchDeliveryRules() {
            this.loading = true
            this.error = null

            try {
                this.deliveryRules = await deliveryRuleService.findAll()
            } catch (error) {
                console.error(error)
                this.error = 'Could not load delivery rules.'
            } finally {
                this.loading = false
            }
        },

        async createDeliveryRule(payload) {
            await deliveryRuleService.create(payload)
            await this.fetchDeliveryRules()
        }
    }
})