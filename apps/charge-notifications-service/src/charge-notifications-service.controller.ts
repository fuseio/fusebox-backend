import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common'
import { probeTcpPort } from '@app/common/utils/tcp-transport'

@Controller()
export class ChargeNotificationsServiceController {
  private readonly logger = new Logger(ChargeNotificationsServiceController.name)

  @Get('health')
  async healthCheck () {
    // The probes reach this over HTTP, which proves nothing about the TCP microservice
    // the api service actually calls — a separate listener in this same process. Check
    // it here so a dead listener fails the probe instead of presenting as a healthy pod
    // whose every get_webhook call times out.
    //
    // Only a definite 'refused' fails the check. Anything indeterminate stays healthy,
    // because a liveness probe that reports unhealthy on its own bugs would restart this
    // pod in a loop.
    const tcpPort = parseInt(process.env.NOTIFICATIONS_TCP_PORT, 10)
    const result = await probeTcpPort(tcpPort)

    if (result === 'refused') {
      throw new ServiceUnavailableException(
        `TCP microservice on port ${tcpPort} is not accepting connections`
      )
    }

    if (result === 'unknown') {
      this.logger.warn(
        `Could not probe the TCP microservice port (NOTIFICATIONS_TCP_PORT=${process.env.NOTIFICATIONS_TCP_PORT}); reporting healthy on HTTP alone`
      )
    }

    return 'ok'
  }
}
