import { fetchSensors } from './sensor-api'
import { mapSensorList } from './sensor-mapper'

export const getSensors = async () => {
  const sensors = await fetchSensors()
  return mapSensorList(sensors)
}

