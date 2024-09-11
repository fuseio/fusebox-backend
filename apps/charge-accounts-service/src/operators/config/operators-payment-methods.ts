import { OperatorPaymentMethodInterface } from '@app/accounts-service/operators/interfaces/operator-payment-method.interface'

export const NATIVE_TOKEN: OperatorPaymentMethodInterface = {
  id: '1',
  symbol: 'USDC',
  tokenAddress: '0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5',
  tokenDecimal: 6
}

export const OPERATOR_PAYMENT_METHODS: OperatorPaymentMethodInterface[] = [NATIVE_TOKEN]
