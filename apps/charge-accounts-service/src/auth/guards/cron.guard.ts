import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class CronGuard implements CanActivate {
  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const headers = request.headers
    const cronHeader = headers['x-cron-secret']
    if (!cronHeader) return false
    return cronHeader === process.env.CRON_JOB_SECRET
  }
}
