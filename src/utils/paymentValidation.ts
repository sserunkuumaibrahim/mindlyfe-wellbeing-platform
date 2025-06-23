// Payment validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999.99 && Number.isFinite(amount)
}

export const validateCurrency = (currency: string): boolean => {
  const supportedCurrencies = ['USD', 'EUR', 'GBP', 'ZAR', 'KES', 'UGX', 'TZS']
  return supportedCurrencies.includes(currency.toUpperCase())
}

export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s+/g, '')
  return /^\d{13,19}$/.test(cleaned)
}

export const validateExpiryDate = (month: string, year: string): boolean => {
  const monthNum = parseInt(month, 10)
  const yearNum = parseInt(year, 10)
  
  if (monthNum < 1 || monthNum > 12) return false
  
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1
  
  if (yearNum < currentYear) return false
  if (yearNum === currentYear && monthNum < currentMonth) return false
  
  return true
}

export const validateCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv)
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>"'&]/g, '')
}