export const InitChannelClientDataType = 'INIT_CHANNEL_CLIENT' as const;
export const InitChannelServiceDataType = 'INIT_CHANNEL_SERVICE' as const;

export interface InitChannelClientMessage extends InitChannelClientData {
  type: typeof InitChannelClientDataType;
}

export interface InitChannelClientData {
  port: MessagePort;
  service: string;
}

export const isClientInitMessage = (evt: Event): evt is MessageEvent<InitChannelClientMessage> =>
  'origin' in evt &&
  'data' in evt &&
  typeof evt.data === 'object' &&
  evt.data !== null &&
  'type' in evt.data &&
  evt.data.type === InitChannelClientDataType;

export interface InitChannelServiceMessage extends InitChannelServiceData {
  type: typeof InitChannelServiceDataType;
}

export interface InitChannelClientMessage extends InitChannelClientData {
  type: typeof InitChannelClientDataType;
}

export interface InitChannelServiceData {
  port: MessagePort;
  services: string[];
}

export interface InitChannelClientData {
  port: MessagePort;
  service: string;
}

export const isInitServiceMessage = (evt: Event): evt is MessageEvent<InitChannelServiceMessage> =>
  'data' in evt &&
  typeof evt.data === 'object' &&
  evt.data !== null &&
  'type' in evt.data &&
  evt.data.type === InitChannelServiceDataType;
