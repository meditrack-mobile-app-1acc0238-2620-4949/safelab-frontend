export class Trend {
    constructor({
                    id,
                    metric,
                    label,
                    value,
                    previousValue = null,
                    variation = null,
                    period
                }) {
        this.id = id
        this.metric = metric
        this.label = label
        this.value = value
        this.previousValue = previousValue
        this.variation = variation
        this.period = period
    }
}
