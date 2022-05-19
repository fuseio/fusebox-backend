import { Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IsProjectOwnerGuard } from '../projects/guards/is-project-owner.guard';
import { IsValidApiSecretKeyGuard } from './guards/is-valid-api-key.guard';
import { ApiKeysService } from './api-keys.service';

@Controller({ path: 'apikeys', version: '1' })
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) { }

  /**
   * Creates a API key secret for the given project
   * @param projectId
   * @returns the generated API key secret or error if secret already exists
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Post('/secret/:projectId')
  createSecret(@Param('projectId') projectId: string) {
    return this.apiKeysService.createSecretKey(projectId);
  }

  /**
   * Revokes the old API key secret and generates a new one for the given project
   * @param projectId
   * @returns the new API key secret
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Put('/secret/:projectId')
  updateSecret(@Param('projectId') projectId: string) {
    return this.apiKeysService.updateSecretKey(projectId);
  }

  /**
   * Revokes the old public API key and generates a new one for the given project
   * @param projectId
   * @returns the new public API key
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Put('/public/:projectId')
  updatePublic(@Param('projectId') projectId: string) {
    return this.apiKeysService.updatePublicKey(projectId);
  }
}
