import { Controller, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/network')
export class NetworkController { }
