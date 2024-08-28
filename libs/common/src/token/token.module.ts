import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import TradeService from '@app/common/token/trade.service'

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      useFactory: () => ({
        ttl: 300, // 5 minutes in seconds
        max: 200 // maximum number of items in cache
      })
    })
  ],
  providers: [TradeService],
  exports: [TradeService, CacheModule]
})
export class TokenModule { }
