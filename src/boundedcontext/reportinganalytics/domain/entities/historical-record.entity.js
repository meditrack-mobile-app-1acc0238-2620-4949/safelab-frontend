export class HistoricalRecord {
    constructor({
                    id,
                    equipmentId,
                    equipmentName,
                    location = '',
                    temperature = null,
                    humidity = null,
                    recordedAt,
                    ...metadata
                }) {
        this.id = id
        this.equipmentId = equipmentId
        this.equipmentName = equipmentName
        this.location = location
        this.temperature = temperature
        this.humidity = humidity
        this.recordedAt = recordedAt
        Object.assign(this, metadata)
    }
}
