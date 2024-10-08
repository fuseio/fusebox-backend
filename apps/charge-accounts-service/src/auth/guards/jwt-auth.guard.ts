import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { operatorJwtString, operatorRefreshJwtString } from '@app/accounts-service/operators/operators.constants'

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt', operatorJwtString, operatorRefreshJwtString]) {}
