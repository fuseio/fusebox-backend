import { Module } from '@nestjs/common';
import { ProjectsService } from '@app/accounts-service/projects/projects.service';
import { ProjectsController } from '@app/accounts-service/projects/projects.controller';
import { DatabaseModule } from '@app/common';
import { projectsProviders } from '@app/accounts-service/projects/projects.providers';
import { UsersModule } from '@app/accounts-service/users/users.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'CHARGE_PAYMENTS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'charge-payments-service',
          port: Number(process.env.PAYMENTS_TCP_PORT),
        },
      },
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ...projectsProviders],
  exports: [ProjectsService],
})
export class ProjectsModule {}
