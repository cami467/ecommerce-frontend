export interface PasswordValidationResult {
  minLength: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  specialChar: boolean
}

export function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidEmail(value: string): boolean {
  const email = value.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPersonName(value: string): boolean {
  const name = normalizeSpaces(value)
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]{2,50}$/.test(name)
}

export function validatePasswordRules(password: string): PasswordValidationResult {
  return {
    minLength: password.length >= 10,
    uppercase: /[A-ZÁÉÍÓÚÑÜ]/.test(password),
    lowercase: /[a-záéíóúñü]/.test(password),
    number: /\d/.test(password),
    specialChar: /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9]/.test(password),
  }
}

export function isPasswordStrong(password: string): boolean {
  const rules = validatePasswordRules(password)
  return Object.values(rules).every(Boolean)
}

// src/utils/validators.ts

export function isStrongPassword(password: string): boolean {
  // mínimo 8 caracteres, al menos una mayúscula, un número y un símbolo
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

export function validatePersonName(value: string, fieldName: string): string | null {
  const normalized = normalizeSpaces(value)

  if (!normalized) {
    return `${fieldName} es obligatorio.`
  }

  if (normalized.length < 2) {
    return `${fieldName} debe tener al menos 2 caracteres.`
  }

  if (normalized.length > 50) {
    return `${fieldName} no puede superar 50 caracteres.`
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$/.test(normalized)) {
    return `${fieldName} solo puede contener letras, espacios, guiones o apóstrofes.`
  }

  return null
}
