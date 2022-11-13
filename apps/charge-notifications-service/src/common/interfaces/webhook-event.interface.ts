import { Document } from 'mongoose'
import { EventData } from '@app/notifications-service/common/interfaces/event-data.interface'

export interface WebhookEvent extends Document, Object {
  readonly webhook: string;
  readonly projectId: string;
  readonly eventData: EventData;
  readonly direction: EventData;
  numberOfTries: number;
  retryAfter: Date;
  success: boolean;
  responses: object[];
}
