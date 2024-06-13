import { createContext } from 'react';
import { PenumbraSymbol } from '@penumbra-zone/client';
import { PenumbraManifest } from './manifest';

const penumbraGlobal = window[PenumbraSymbol];

export enum PenumbraProviderState {
  'Failed' = 'Failed', // error available at `failure`

  'Present' = 'Present', // injection present, manifest present
  'Injected' = 'Injected', // injection present, manifest fetch pending
  'Absent' = 'Absent', // injection absent

  'Connected' = 'Connected', // connected
  'Pending' = 'Pending', // connection attempt pending

  'Requested' = 'Requested', //  approval request pending

  'Disconnected' = 'Disconnected', // approval released
}

export interface PenumbraContext {
  origin?: keyof NonNullable<typeof penumbraGlobal>;
  manifest?: PenumbraManifest;
  disconnect?: () => Promise<void>;
  port?: MessagePort;
  failure?: Error;
  state?: PenumbraProviderState;
}

export const penumbraContext = createContext<PenumbraContext>({});
