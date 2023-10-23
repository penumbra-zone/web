export enum MessageType {
  CONNECT = 'CONNECT',
  SEND = 'SEND',
}

export enum MessageStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Message {
  id: string;
  type: MessageType;
  origin: string;
  status: MessageStatus;
}
