import { Injectable } from '@nestjs/common'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'

@Injectable()
export class WebhooksService {
  constructor (
    @InjectRedis() private readonly redis: Redis
  ) { }

  async ping (): Promise<string> {
    return this.redis.ping()
  }
}
