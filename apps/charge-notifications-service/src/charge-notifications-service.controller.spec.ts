import { Test, TestingModule } from '@nestjs/testing';
import { ChargeNotificationsServiceController } from './charge-notifications-service.controller';
import { ChargeNotificationsServiceService } from './charge-notifications-service.service';

describe('ChargeNotificationsServiceController', () => {
  let chargeNotificationsServiceController: ChargeNotificationsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChargeNotificationsServiceController],
      providers: [ChargeNotificationsServiceService],
    }).compile();

    chargeNotificationsServiceController = app.get<ChargeNotificationsServiceController>(ChargeNotificationsServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(chargeNotificationsServiceController.getHello()).toBe('Hello World!');
    });
  });
});
