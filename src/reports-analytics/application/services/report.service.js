import { ReportsApiService } from '../../infrastructure/http/reports-api.service'
import { Report } from '../../domain/entities/report.entity'

const api = new ReportsApiService()

export class ReportService {
    async findAll() {
        const response = await api.getAll()
        return response.data.map((report) => new Report(report))
    }

    async findById(id) {
        const response = await api.getById(id)
        return new Report(response.data)
    }

    async generate(payload) {
        const response = await api.generate(payload)
        return new Report(response.data)
    }

    async download(id) {
        return await api.download(id)
    }
}
