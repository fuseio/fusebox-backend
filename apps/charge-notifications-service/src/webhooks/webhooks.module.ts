import { DatabaseModule } from '@app/common'
// import redis from '@app/notifications-service/config/redis-config'
import { WebhooksController } from '@app/notifications-service/webhooks/webhooks.controller'
import { webhooksProviders } from '@app/notifications-service/webhooks/webhooks.providers'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
// import { RedisModule } from '@liaoliaots/nestjs-redis'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    DatabaseModule
    // Removing Redis for now as we will use only Mongo initially
    // RedisModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => {
    //     console.log('Redis config ' + JSON.stringify(configService.get('redis')))
    //     return { config: configService.get('redis') }
    //   },
    //   imports: [ConfigModule.forFeature(redis)],
    //   inject: [ConfigService]
    // })
  ],
  providers: [WebhooksService, ...webhooksProviders],
  controllers: [WebhooksController]
})
export class WebhooksModule {}
