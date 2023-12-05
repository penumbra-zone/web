import {
  ChannelClientLabel,
  InitChannelServiceDataType,
  InitChannelServiceMessage,
} from '@penumbra-zone/transport/src/types';
import type { serviceTypeNames } from '@penumbra-zone/types/src/registry';

import { ClientConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/client-connection-manager';

const services: typeof serviceTypeNames = [
  'ibc.core.client.v1.Query',
  'penumbra.custody.v1alpha1.CustodyProtocolService',
  'penumbra.core.component.dex.v1alpha1.SimulationService',
  'penumbra.util.tendermint_proxy.v1alpha1.TendermintProxyService',
  'penumbra.view.v1alpha1.ViewProtocolService',
];

const { port1, port2 } = new MessageChannel();

window.postMessage(
  {
    type: InitChannelServiceDataType,
    services: [...services],
    port: port1,
  } as InitChannelServiceMessage,
  '/',
  [port1],
);

ClientConnectionManager.init(ChannelClientLabel.ContentScript, port2);
