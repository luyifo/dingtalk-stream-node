export const enum MessageType {
  SYSTEM = "SYSTEM",
  EVENT = "EVENT",
  CALLBACK = "CALLBACK",
}

export interface MessageHeaders {
  topic: string;
  contentType: "application/json";
  messageId: string;
  time: number;
}

export interface EventMessageHeader extends MessageHeaders {
  eventId: string;
  eventBornTime: string;
  eventCorpId: string;
  eventType: string;
  eventunifiedAppId: string;
}

export interface StreamMessage {
  specVersion: string;
  type: MessageType;
  headers: MessageHeaders | EventMessageHeader;
  data: string;
}

// export class StreamMessage {
//   constructor(
//     private specVersion: string,
//     private type: MessageType,
//     private headers: MessageHeaders | EventMessageHeader,
//     private data: string
//   ) {}
// }