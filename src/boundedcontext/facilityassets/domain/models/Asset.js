export class Asset {
    constructor({
                    id = null,
                    name = '',
                    category = '',
                    storageUnit = '',
                    location = '',
                    status = 'compliant',
                    lastInspection = '',
                    responsible = '',
                    ...metadata
                } = {}) {
        this.id = id
        this.name = name
        this.category = category
        this.storageUnit = storageUnit
        this.location = location
        this.status = status
        this.lastInspection = lastInspection
        this.responsible = responsible
        Object.assign(this, metadata)
    }
}