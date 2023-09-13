import { SwMessage, SwMessageHandler } from '../types';

import { Controllers, ControllersProps } from '../../../controllers/initialize';
import { services } from '../../../service-worker';

export type InitializeMessage = SwMessage<'INITIALIZE', InitializeRequest, Promise<void>>;

export interface InitializeRequest {
  grpcEndpoint: string;
  indexedDbVersion: number;
  fullViewingKey: string;
}

export const initializeHandler: SwMessageHandler<InitializeMessage> = async ({
  grpcEndpoint,
  indexedDbVersion,
  fullViewingKey,
}) => {
  await initializeControllers({ grpcEndpoint, indexedDbVersion, fullViewingKey });
};

export const initializeControllers = async (props: ControllersProps) => {
  const controllers = await Controllers.initialize(props);
  services.setControllers(controllers);
  // TODO: Should sync blocks here
  // await services.controllers.blockProcessor.syncBlocks()
};
