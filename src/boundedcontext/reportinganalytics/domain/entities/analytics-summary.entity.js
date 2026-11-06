export class AnalyticsSummary {
    constructor({
                    totalReports = 0,
                    totalIncidents = 0,
                    averageTemperature = null,
                    averageHumidity = null,
                    equipmentWithAlerts = 0
                }) {
        this.totalReports = totalReports
        this.totalIncidents = totalIncidents
        this.averageTemperature = averageTemperature
        this.averageHumidity = averageHumidity
        this.equipmentWithAlerts = equipmentWithAlerts
    }
}
