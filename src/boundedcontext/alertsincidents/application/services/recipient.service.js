import { RecipientsApiService } from '../../infrastructure/http/recipients-api.service';
import { Recipient } from '../../domain/entities/recipient.entity';

const api = new RecipientsApiService();

export class RecipientService {
    async findAll(filters = {}) {
        const response = await api.getAll(filters);
        return response.data.map((recipient) => new Recipient(recipient));
    }
}