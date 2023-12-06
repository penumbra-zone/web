export interface InitPenumbraService {
  type: 'INIT_PENUMBRA';
  port: MessagePort;
  services: string[];
}

export const isInitPenumbra = (evt: Event): evt is MessageEvent<InitPenumbraService> =>
  'data' in evt &&
  typeof evt.data === 'object' &&
  evt.data !== null &&
  'type' in evt.data &&
  evt.data.type === 'INIT_PENUMBRA';
