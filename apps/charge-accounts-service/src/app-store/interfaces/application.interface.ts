import { Document } from 'mongoose'

export interface Application extends Document {
  readonly ownerId: string;
  readonly appName: string;
  readonly isActivated: boolean;
}

export interface AvailableApp {
    readonly appName: string;
    readonly hasApi: boolean;
}

export interface ActivatedApp extends AvailableApp, Application {}
