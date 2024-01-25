/*
 * This content script is injected but isolated from the page, and hosts the
 * client-side connection manager.
 */

import type { InitPenumbraService } from './types/content-script-init';
import type { serviceTypeNames } from '@penumbra-zone/types/src/registry';
import { ChannelClientLabel } from '@penumbra-zone/transport/src/types';
import { ClientConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/client-connection-manager';

/**
 * This could just be imported, but declaring it locally helps the bundler
 * reduce the size of the emitted js, and importing the type helps confirm
 * correctness.
 *
 * We don't actually have routes for all these services yet, but the app doesn't
 * handle an absence yet.
 */
const services: typeof serviceTypeNames = [
  'ibc.core.client.v1.Query',
  'penumbra.custody.v1alpha1.CustodyProtocolService',
  'penumbra.core.component.dex.v1alpha1.SimulationService',
  'penumbra.util.tendermint_proxy.v1alpha1.TendermintProxyService',
  'penumbra.view.v1alpha1.ViewProtocolService',
];

const sendInitMsg = (services: string[]) => {
  console.log('sendInitMsg');
  const { port1, port2 } = new MessageChannel();
  const initMsg: InitPenumbraService = { type: 'INIT_PENUMBRA', services, port: port1 };
  window.postMessage(initMsg, '/', [port1]);
  return port2;
};

/*
 * Connection manager inits with half of the channel just sent to the page.
 */
const initPort = sendInitMsg([...services]);
ClientConnectionManager.init(ChannelClientLabel.ContentScript, initPort);
