import { HistoricalDataApiService } from '../../infrastructure/http/historical-data-api.service'
import { HistoricalRecord } from '../../domain/entities/historical-record.entity'

const api = new HistoricalDataApiService()

export class HistoricalDataService {
    async findAll(filters = {}) {
        const response = await api.getAll(filters)
        return response.data.map((record) => new HistoricalRecord(record))
    }
}
