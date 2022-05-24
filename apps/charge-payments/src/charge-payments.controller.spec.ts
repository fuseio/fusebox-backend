import { Test, TestingModule } from '@nestjs/testing';
import { ChargePaymentsController } from './charge-payments.controller';
import { ChargePaymentsService } from './charge-payments.service';

describe('ChargePaymentsController', () => {
  let chargePaymentsController: ChargePaymentsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChargePaymentsController],
      providers: [ChargePaymentsService],
    }).compile();

    chargePaymentsController = app.get<ChargePaymentsController>(
      ChargePaymentsController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(chargePaymentsController.getHello()).toBe('Hello World!');
    });
  });
});
