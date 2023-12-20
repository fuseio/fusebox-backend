import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { operatorJwtString } from '@app/accounts-service/auth/auth.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt', operatorJwtString]) {}
