import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { StudioLegacyJwtService } from '@app/api-service/studio-legacy-jwt/studio-legacy-jwt.service'

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${configService.get('FUSE_STUDIO_ADMIN_JWT')}`
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [StudioLegacyJwtService],
  exports: [StudioLegacyJwtService]
})
export class StudioLegacyJwtModule { }
