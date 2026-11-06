export const assertRequired = (value, name) => {
  if (value === undefined || value === null) {
    throw new Error(`${name} is required`)
  }
}

export const assertString = (value, name) => {
  assertRequired(value, name)
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${name} must be a non-empty string`)
  }
}

export const assertNumber = (value, name) => {
  assertRequired(value, name)
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`)
  }
}

export const assertDate = (value, name) => {
  assertRequired(value, name)
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(`${name} must be a valid Date`)
  }
}

export const assertEnum = (value, enumType, name) => {
  assertRequired(value, name)
  if (!Object.values(enumType).includes(value)) {
    throw new Error(`${name} must be one of: ${Object.values(enumType).join(', ')}`)
  }
}

