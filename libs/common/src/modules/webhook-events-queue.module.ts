import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { webhookEventsQueueString } from '@app/common/constants/queues.constants'

@Module({
  imports: [
    BullModule.registerQueueAsync({
      inject: [ConfigService],
      name: webhookEventsQueueString,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db')
        },
        settings: {
          backoffStrategies: {
            custom: (attemptsMade: number) => {
              const delays = configService.get('retryTimeIntervalsMS') as Record<number, number>
              return delays[attemptsMade]
            }
          }
        }
      })
    })
  ],
  exports: [BullModule]
})

export class WebhookEventsQueueModule { }
