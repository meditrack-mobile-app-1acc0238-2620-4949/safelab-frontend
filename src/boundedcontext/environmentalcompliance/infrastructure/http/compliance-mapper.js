const parseDate = (value) => {
    if (!value) {
        return null
    }

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

const normalizeThreshold = (threshold) => ({
    id: threshold.id,
    minValue: threshold.minValue,
    maxValue: threshold.maxValue,
    status: threshold.status
})

export const mapSensorDto = (dto) => ({
    id: dto.id,
    name: dto.name,
    code: dto.code,
    type: dto.type,
    value: dto.value,
    status: dto.status,
    sensorStatus: dto.sensorStatus,
    installedAt: parseDate(dto.installedAt),
    lastReadingAt: parseDate(dto.lastReadingAt || dto.installedAt),
    thresholds: Array.isArray(dto.thresholds)
        ? dto.thresholds.map(normalizeThreshold)
        : []
})

export const mapSensorList = (dtos) => dtos.map(mapSensorDto)