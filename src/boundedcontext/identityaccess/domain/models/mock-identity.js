/** Demo identity shared with the SafeLab Android frontend. Replace with backend IAM later. */
export const ADMIN_ID = '9f63a2e0-6839-4bff-9664-23eb8acfb9ca'
export const ADMIN_USERNAME = '691339768298838915'
export const ADMIN_EMAIL = 'admin@safelab.test'
export const ADMIN_PASSWORD = 'SafeLab2026%'

/** 18-digit account username with cryptographic browser randomness. */
export function generateUsername(existing = []) {
  const used = new Set(existing)
  for (let attempt = 0; attempt < 25; attempt++) {
    const values = new Uint32Array(18)
    crypto.getRandomValues(values)
    const username = String((values[0] % 9) + 1) + Array.from(values.slice(1), (value) => value % 10).join('')
    if (!used.has(username)) return username
  }
  throw new Error('Could not generate a unique username.')
}

export function generateUserId() {
  return crypto.randomUUID()
}

export const isValidName = (value) => /^[\p{L}]+(?:[ '’-][\p{L}]+)*$/u.test(value.trim())
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
export const isValidPhone = (value) => /^\d{9,15}$/.test(value.replace(/[\s-]/g, ''))
export const isValidPassword = (value) => value.length >= 10 && /[A-Za-z]/.test(value) && /\d/.test(value) && /[@%&$]/.test(value)
