import { EscalationPoliciesApiService } from '../../infrastructure/http/escalation-policies-api.service';
import { EscalationPolicy } from '../../domain/entities/escalation-policy.entity';

const api = new EscalationPoliciesApiService();

export class EscalationPolicyService {
    async findAll(filters = {}) {
        const response = await api.getAll(filters);
        return response.data.map((policy) => new EscalationPolicy(policy));
    }

    async create(payload) {
        const response = await api.create(payload);
        return new EscalationPolicy(response.data);
    }

    async update(id, payload) {
        const response = await api.update(id, payload);
        return new EscalationPolicy(response.data);
    }

    async delete(id) {
        return await api.delete(id);
    }
}