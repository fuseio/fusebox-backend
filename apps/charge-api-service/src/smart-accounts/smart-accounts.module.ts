import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module';
import { smartAccountsService } from '@app/common/constants/microservices.constants';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SmartAccountsController } from './smart-accounts.controller';
import { SmartAccountsService } from './smart-accounts.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: smartAccountsService,
        transport: Transport.TCP,
        options: {
          host: process.env.SMART_ACCOUNTS_HOST,
          port: parseInt(process.env.SMART_ACCOUNTS_TCP_PORT)
        }
      }
    ]),
    ApiKeyModule
  ],
  controllers: [SmartAccountsController],
  providers: [SmartAccountsService]
})
export class SmartAccountsModule {}
