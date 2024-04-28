import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SWAGGER_SCHEMA_DEFINITIONS } from '../../constants/swagger-schemas'

export function setupSwagger (app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('FuseBox API')
    .setDescription('FuseBox is an Open Source Wallet-As-A-Service platform based on Account Abstraction')
    .setExternalDoc('Fuse Docs', 'https://docs.fuse.io')
    .build()
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
