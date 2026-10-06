import axios from 'axios'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://safelab-platform-api.onrender.com/api/v1'
).replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.response.use(
  response => response,
  error => {
    const normalized = new Error(
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'SafeLab API request failed'
    )
    normalized.status = error?.response?.status
    normalized.details = error?.response?.data
    normalized.original = error
    return Promise.reject(normalized)
  }
)
