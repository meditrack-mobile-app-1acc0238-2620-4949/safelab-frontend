import { getSensorsForCompliance } from '@/boundedcontext/environmentalcompliance/infrastructure/http'

export const fetchComplianceSensors = async () => getSensorsForCompliance()

