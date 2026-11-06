import { DeliveryRulesApiService } from '../../infrastructure/http/delivery-rules-api.service'
import { DeliveryRule } from '../../domain/entities/delivery-rule.entity'

const api = new DeliveryRulesApiService()

export class DeliveryRuleService {
    async findAll() {
        const response = await api.getAll()
        return response.data.map((rule) => new DeliveryRule(rule))
    }

    async create(payload) {
        const response = await api.create(payload)
        return new DeliveryRule(response.data)
    }

    async update(id, payload) {
        const response = await api.update(id, payload)
        return new DeliveryRule(response.data)
    }

    async delete(id) {
        return await api.delete(id)
    }
}