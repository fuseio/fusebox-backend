import { Request } from 'express'

export interface PrdOrSbxKeyRequest extends Request {
  projectId: string;
  environment: string;
}
