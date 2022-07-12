import { ProjectsController } from '@app/accounts-service/projects/projects.controller'
import { projectsProviders } from '@app/accounts-service/projects/projects.providers'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { DatabaseModule } from '@app/common'
import {
  apiService
  // relayService
} from '@app/common/constants/microservices.constants'
import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    ClientsModule.register([
      {
        name: apiService,
        transport: Transport.TCP,
        options: {
          host: process.env.API_HOST,
          port: parseInt(process.env.API_TCP_PORT)
        }
      }
    ])
    // ClientsModule.register([
    //   {
    //     name: relayService,
    //     transport: Transport.TCP,
    //     options: {
    //       host: process.env.RELAY_HOST,
    //       port: parseInt(process.env.RELAY_TCP_PORT)
    //     }
    //   }
    // ])
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ...projectsProviders],
  exports: [ProjectsService]
})
export class ProjectsModule {}
