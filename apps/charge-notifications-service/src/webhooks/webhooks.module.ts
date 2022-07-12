import { Module } from '@nestjs/common'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { WebhooksController } from '@app/notifications-service/webhooks/webhooks.controller'
import redis from '@app/notifications-service/config/redis-config'
import { DatabaseModule } from '@app/common'
import { webhookssProviders } from '@app/notifications-service/webhooks/webhooks.providers'

@Module({
  imports: [
    DatabaseModule,
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        console.log('Redis config ' + JSON.stringify(configService.get('redis')))
        return { config: configService.get('redis') }
      },
      imports: [ConfigModule.forFeature(redis)],
      inject: [ConfigService]
    })
  ],
  providers: [WebhooksService, ...webhookssProviders],
  controllers: [WebhooksController]
})
export class WebhooksModule {}
