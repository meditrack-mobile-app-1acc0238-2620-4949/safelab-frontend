import { defineStore } from 'pinia';
import { EscalationPolicyService } from '../services/escalation-policy.service';

const escalationPolicyService = new EscalationPolicyService();

export const useEscalationPolicyStore = defineStore('escalationPolicies', {
    state: () => ({
        escalationPolicies: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchEscalationPolicies(filters = {}) {
            this.loading = true;
            this.error = null;

            try {
                this.escalationPolicies = await escalationPolicyService.findAll(filters);
            } catch (error) {
                this.error = 'Could not load escalation policies.';
            } finally {
                this.loading = false;
            }
        },

        async createEscalationPolicy(payload) {
            await escalationPolicyService.create(payload);
            await this.fetchEscalationPolicies();
        },

        async updateEscalationPolicy(id, payload) {
            await escalationPolicyService.update(id, payload);
            await this.fetchEscalationPolicies();
        },

        async deleteEscalationPolicy(id) {
            await escalationPolicyService.delete(id);
            await this.fetchEscalationPolicies();
        }
    }
});