import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SWAGGER_SCHEMA_DEFINITIONS } from '../../constants/swagger-schemas'
import metadata from '@app/api-service/metadata'

export async function setupSwagger (app: INestApplication): Promise<void> {
  const config = new DocumentBuilder()
    .setTitle('FuseBox API')
    .setDescription('FuseBox is an Open Source Wallet-As-A-Service platform based on Account Abstraction')
    .setExternalDoc('Fuse Docs', 'https://docs.fuse.io')
    .addServer('https://api.fuse.io', 'Production')
    .addServer('https://api.staging.fuse.io', 'Staging')
    .addServer('http://localhost:5002', 'Local')
    .build()
  await SwaggerModule.loadPluginMetadata(metadata)
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
