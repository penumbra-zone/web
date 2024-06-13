import { createContext } from 'react';
import { PenumbraInjectionState, PenumbraSymbol } from '@penumbra-zone/client';
import { PenumbraManifest } from './manifest';

const penumbraGlobal = window[PenumbraSymbol];

export interface PenumbraContext {
  origin?: keyof NonNullable<typeof penumbraGlobal>;
  manifest?: PenumbraManifest;
  disconnect?: () => Promise<void>;
  port?: MessagePort | false;
  failure?: Error;
  state?: PenumbraInjectionState;
}

export const penumbraContext = createContext<PenumbraContext>({});
