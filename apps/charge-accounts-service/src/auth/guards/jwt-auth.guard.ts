import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { simpleJwtString } from '@app/accounts-service/auth/auth.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt', simpleJwtString]) {}
