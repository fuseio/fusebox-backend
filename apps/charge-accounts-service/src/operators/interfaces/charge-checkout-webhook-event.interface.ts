export interface ChargeCheckoutWebhookEvent {
  sessionId: string
  paymentStatus: string
  totalAmount: string
}
