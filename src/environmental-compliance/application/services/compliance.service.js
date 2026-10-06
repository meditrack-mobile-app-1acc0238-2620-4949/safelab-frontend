import { getSensorsForCompliance } from '@/environmental-compliance/infrastructure/http'

export const fetchComplianceSensors = async () => getSensorsForCompliance()

