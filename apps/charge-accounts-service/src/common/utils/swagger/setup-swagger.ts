import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import metadata from '@app/accounts-service/metadata'

export async function setupSwagger (app: INestApplication): Promise<void> {
  const config = new DocumentBuilder()
    .setTitle('FuseBox Accounts API')
    .setExternalDoc('Fuse Docs', 'https://docs.fuse.io')
    .addServer('https://accounts.fuse.io', 'Production')
    .addServer('https://accounts.staging.fuse.io', 'Staging')
    .addServer(`http://localhost:${process.env.ACCOUNTS_PORT}`, 'Local')
    .build()

  await SwaggerModule.loadPluginMetadata(metadata)
  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api', app, document)
}
