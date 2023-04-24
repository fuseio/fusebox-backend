import { Module } from '@nestjs/common'
import { GraphqlController } from 'apps/charge-network-service/src/graphql/graphql.controller'
import GraphQLService from '@app/common/services/graphql.service'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import configuration from 'apps/charge-network-service/src/common/config/configuration'

@Module({
  imports: [
    ConfigModule.forFeature(configuration),
    HttpModule
  ],
  controllers: [GraphqlController],
  providers: [GraphQLService]
})
export class GraphqlModule {}
