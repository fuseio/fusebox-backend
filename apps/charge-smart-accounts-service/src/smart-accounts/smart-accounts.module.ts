import { SmartAccountEventsGateway } from '@app/smart-accounts-service/smart-accounts/smart-account-events.gateway';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SmartAccountEventsGateway]
})
export class SmartAccountsModule {}
