import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { StudioLegacyJwtService } from './studio-legacy-jwt.service'

@Module({
  imports: [HttpModule],
  providers: [StudioLegacyJwtService],
  exports: [StudioLegacyJwtService]
})
export class StudioLegacyJwtModule { }
