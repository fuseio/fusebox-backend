import { Test, TestingModule } from '@nestjs/testing';
import { ChargeAppsServiceController } from './charge-apps-service.controller';
import { ChargeAppsServiceService } from './charge-apps-service.service';

describe('ChargeAppsServiceController', () => {
  let chargeAppsServiceController: ChargeAppsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChargeAppsServiceController],
      providers: [ChargeAppsServiceService],
    }).compile();

    chargeAppsServiceController = app.get<ChargeAppsServiceController>(ChargeAppsServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(chargeAppsServiceController.getHello()).toBe('Hello World!');
    });
  });
});
