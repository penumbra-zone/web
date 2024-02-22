export const InitChannelClientDataType = 'INIT_CHANNEL_CLIENT' as const;

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
