import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SWAGGER_SCHEMA_DEFINITIONS } from '../../constants/swagger-schemas'
import metadata from '@app/api-service/metadata'
import networkMetadata from '@app/network-service/metadata'
import { OperatorsModule } from '@app/accounts-service/operators/operators.module'

export async function setupSwagger (app: INestApplication): Promise<void> {
  const config = new DocumentBuilder()
    .setTitle('FuseBox API')
    .setDescription('FuseBox is an Open Source Wallet-As-A-Service platform based on Account Abstraction')
    .setExternalDoc('Fuse Docs', 'https://docs.fuse.io')
    .addServer('https://api.fuse.io', 'Production')
    .addServer('https://api.staging.fuse.io', 'Staging')
    .addServer(`http://localhost:${process.env.API_PORT}`, 'Local')
    .build()

  await SwaggerModule.loadPluginMetadata(metadata)
  await SwaggerModule.loadPluginMetadata(networkMetadata)
  const document = SwaggerModule.createDocument(app, config)

  document.components = {
    ...document.components,
    ...{
      schemas: {
        ...document.components.schemas,
        ...SWAGGER_SCHEMA_DEFINITIONS.schemas
      }
    }
  }

  SwaggerModule.setup('api', app, document)
}
