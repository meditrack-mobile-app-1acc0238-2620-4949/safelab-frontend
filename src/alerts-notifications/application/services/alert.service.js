import { AlertsApiService } from '../../infrastructure/http/alerts-api.service';
import { Alert } from '../../domain/entities/alert.entity';

const api = new AlertsApiService();

export class AlertService {
    async findAll(filters = {}) {
        const response = await api.getAll(filters);
        return response.data.map((alert) => new Alert(alert));
    }

    async findById(id) {
        const response = await api.getById(id);
        return new Alert(response.data);
    }

    async acknowledge(id) {
        const response = await api.acknowledge(id);
        return new Alert(response.data);
    }

    async resolve(id) {
        const response = await api.resolve(id);
        return new Alert(response.data);
    }

    async escalate(id) {
        const response = await api.escalate(id);
        return new Alert(response.data);
    }
}