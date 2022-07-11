import { Module } from '@nestjs/common'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { WebhooksController } from '@app/notifications-service/webhooks/webhooks.controller'
import redis from '@app/notifications-service/config/redis-config'

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        console.log('Redis config ' + JSON.stringify(configService.get('redis')))
        return { config: configService.get('redis') }
      },
      imports: [ConfigModule.forFeature(redis)],
      inject: [ConfigService]
    })
  ],
  providers: [WebhooksService],
  controllers: [WebhooksController]
})
export class WebhooksModule {}
