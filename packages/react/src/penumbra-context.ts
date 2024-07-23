import type { Transport } from '@connectrpc/connect';
import { PenumbraProvider, type PenumbraManifest, type PenumbraState } from '@penumbra-zone/client';
import type { ChannelTransportOptions } from '@penumbra-zone/transport-dom/create';
import { createContext } from 'react';

export type PenumbraContext = Partial<Omit<PenumbraProvider, 'manifest' | 'state'>> & {
  origin?: string;
  manifest?: PenumbraManifest;
  port?: MessagePort | false;
  failure?: Error;
  state?: PenumbraState;
  transport?: Transport;
  transportOpts?: Omit<ChannelTransportOptions, 'getPort'>;
};

export const penumbraContext = createContext<PenumbraContext>({});
