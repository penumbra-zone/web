import { services } from '../../../service-worker';
import { SwMessage, SwMessageHandler } from './types';

export type OpenWindowMessage = SwMessage<'OPEN_WINDOW', undefined, Promise<void>>;

export const openWindowHandler: SwMessageHandler<OpenWindowMessage> = async () => {
  await services.openWindow();
};
