import { OperatorPricingPlanInterface } from '@app/accounts-service/operators/interfaces/operator-pricing-plan.interface'

export const BASIC_PLAN: OperatorPricingPlanInterface = {
  id: '1',
  name: 'Basic Plan',
  priceInUsd: 100,
  duration: 30 * 24 * 60 * 60 * 1000
}

export const OPERATOR_PLANS: OperatorPricingPlanInterface[] = [BASIC_PLAN]
