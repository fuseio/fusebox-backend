export enum ChargeCheckoutStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ChargeCheckoutPaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded'
}

export enum ChargeCheckoutBillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}
