import { OperatorPaymentMethodInterface } from '@app/accounts-service/operators/interfaces/operator-payment-method.interface'

export const USDC: OperatorPaymentMethodInterface = {
  id: '1',
  symbol: 'USDC',
  tokenAddress: '0x28C3d1cD466Ba22f6cae51b1a4692a831696391A',
  tokenDecimal: 6
}

export const OPERATOR_PAYMENT_METHODS: OperatorPaymentMethodInterface[] = [USDC]
