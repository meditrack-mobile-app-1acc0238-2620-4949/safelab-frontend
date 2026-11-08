import axios from 'axios'

// Solo la URL del backend Spring Boot: nunca se llama directamente a PostgreSQL ni a JSON Server.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '')
export const TOKEN_KEY = 'safelab-api-token-v25'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.request.use(config => {
  const token = sessionStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
apiClient.interceptors.response.use(response => response, error => {
  const normalized = new Error(
    error?.response?.data?.message || error?.message || 'No se pudo conectar con SafeLab API'
  )
  normalized.status = error?.response?.status
  normalized.code = error?.response?.data?.code
  normalized.fieldErrors = error?.response?.data?.fieldErrors
  normalized.details = error?.response?.data
  return Promise.reject(normalized)
})
