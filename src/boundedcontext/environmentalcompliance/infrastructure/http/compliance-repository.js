import { fetchSensors } from './compliance-api'
import { mapSensorList } from './compliance-mapper'

export const getSensorsForCompliance = async () => {
  const sensors = await fetchSensors()
  return mapSensorList(sensors)
}

