import { Injectable, Logger } from '@nestjs/common'
import { init, track, Types } from '@amplitude/analytics-node'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)

  constructor (
    private configService: ConfigService
  ) {
    init(this.configService.getOrThrow('amplitudeApiKey'))
  }

  async trackEvent (eventInput: string | Types.BaseEvent, eventProperties?: Record<string, any>, eventOptions?: Types.EventOptions) {
    try {
      track(eventInput, eventProperties, eventOptions)
    } catch (error) {
      this.logger.error(error)
    }
  }
}
