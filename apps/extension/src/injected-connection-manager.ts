/*
 * This content script is injected but isolated from the page, and hosts the
 * client-side connection manager.
 */

import { ClientConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/client-connection-manager';
import { ChannelClientLabel } from '@penumbra-zone/transport/src/types';
import type { serviceTypeNames } from '@penumbra-zone/types/src/registry';
import type { InitPenumbraService } from './types/content-script-init';

/**
 * This could just be imported, but declaring it locally helps the bundler
 * reduce the size of the emitted js, and importing the type helps confirm
 * correctness.
 *
 * We don't actually have routes for all these services yet, but the app doesn't
 * handle an absence yet.
 */
const services: typeof serviceTypeNames = [
  'penumbra.custody.v1alpha1.CustodyProtocolService',
  'penumbra.view.v1alpha1.ViewProtocolService',

  'ibc.core.client.v1.Query',

  'penumbra.core.app.v1alpha1.QueryService',
  'penumbra.core.component.chain.v1alpha1.QueryService',
  'penumbra.core.component.compact_block.v1alpha1.QueryService',
  'penumbra.core.component.dex.v1alpha1.QueryService',
  'penumbra.core.component.dex.v1alpha1.SimulationService',
  'penumbra.core.component.governance.v1alpha1.QueryService',
  'penumbra.core.component.sct.v1alpha1.QueryService',
  'penumbra.core.component.shielded_pool.v1alpha1.QueryService',
  'penumbra.core.component.stake.v1alpha1.QueryService',
  'penumbra.util.tendermint_proxy.v1alpha1.TendermintProxyService',
];

const sendInitMsg = (services: string[]) => {
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
