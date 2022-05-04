import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
    imports: [UsersModule, PassportModule.register({ defaultStrategy: 'jwt' })],
    providers: [JwtStrategy],
    exports: [PassportModule],
    controllers: [AuthController],
})
export class AuthModule { }