import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { operatorJwtString } from '@app/accounts-service/operators/operators.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt', operatorJwtString]) {}
