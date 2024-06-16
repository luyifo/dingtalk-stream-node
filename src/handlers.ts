import { StreamMessage } from "./message";

export enum AckMessageStatus {
  SUCCESS = "SUCCESS",
  LATER = "LATER",
}

export interface AckMessage {
  status: AckMessageStatus;
  message?: string;
}

export interface IEventHandler {
  handle(message: StreamMessage): AckMessage;
}

