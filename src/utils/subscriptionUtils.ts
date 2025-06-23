// Subscription utilities

export interface RetrySchedule {
  attempt: number
  nextRetryDate: Date
  maxRetries: number
}

export const calculateRetryDate = (attempt: number): Date => {
  const baseDelay = [1, 3, 7] // days
  const delayDays = baseDelay[Math.min(attempt - 1, baseDelay.length - 1)]
  const retryDate = new Date()
  retryDate.setDate(retryDate.getDate() + delayDays)
  return retryDate
}

export const createRetrySchedule = (attempt: number): RetrySchedule => {
  return {
    attempt,
    nextRetryDate: calculateRetryDate(attempt),
    maxRetries: 3
  }
}

export const isRetryLimitReached = (attempt: number): boolean => {
  return attempt >= 3
}

export const formatSubscriptionStatus = (status: string): string => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export const calculateProrationAmount = (
  currentPlanPrice: number,
  newPlanPrice: number,
  daysRemaining: number,
  totalDaysInPeriod: number
): number => {
  const currentPlanDailyRate = currentPlanPrice / totalDaysInPeriod
  const newPlanDailyRate = newPlanPrice / totalDaysInPeriod
  const proratedRefund = currentPlanDailyRate * daysRemaining
  const proratedCharge = newPlanDailyRate * daysRemaining
  return proratedCharge - proratedRefund
}

export const validatePlanUpgrade = (currentPlan: string, newPlan: string): boolean => {
  const planHierarchy = ['basic', 'premium', 'enterprise']
  const currentIndex = planHierarchy.indexOf(currentPlan.toLowerCase())
  const newIndex = planHierarchy.indexOf(newPlan.toLowerCase())
  return newIndex > currentIndex
}

export const validatePlanDowngrade = (currentPlan: string, newPlan: string): boolean => {
  const planHierarchy = ['basic', 'premium', 'enterprise']
  const currentIndex = planHierarchy.indexOf(currentPlan.toLowerCase())
  const newIndex = planHierarchy.indexOf(newPlan.toLowerCase())
  return newIndex < currentIndex
}