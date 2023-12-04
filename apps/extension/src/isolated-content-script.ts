import {
  ChannelClientLabel,
  InitChannelServiceDataType,
  InitChannelServiceMessage,
} from '@penumbra-zone/transport';

import { serviceTypeNames } from '@penumbra-zone/types/src/registry';

import { ClientConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime';

const { port1, port2 } = new MessageChannel();

window.postMessage(
  {
    type: InitChannelServiceDataType,
    services: serviceTypeNames,
    port: port1,
  } as InitChannelServiceMessage,
  '/',
  [port1],
);

ClientConnectionManager.init(ChannelClientLabel.ContentScript, port2);
