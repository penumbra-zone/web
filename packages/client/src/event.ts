import { PenumbraProviderNotAvailableError } from './error.js';
import { PenumbraState } from './state.js';
import { PenumbraSymbol } from './symbol.js';

export interface PenumbraStateEventDetail {
  origin: string;
  connected: boolean;
  state: PenumbraState;
}

export class PenumbraStateEvent extends CustomEvent<PenumbraStateEventDetail> {
  constructor(penumbraOrigin: string, penumbraState?: PenumbraState, penumbraConnected?: boolean) {
    const provider = window[PenumbraSymbol]?.[penumbraOrigin];
    if (!provider) {
      throw new PenumbraProviderNotAvailableError(penumbraOrigin);
    }
    const state = penumbraState ?? provider.state();
    const connected = penumbraConnected ?? provider.isConnected();
    super('penumbrastate', {
      detail: {
        origin: penumbraOrigin,
        state,
        connected,
      },
    });
  }
}

export const isPenumbraStateEvent = (evt: Event): evt is PenumbraStateEvent =>
  evt instanceof PenumbraStateEvent || ('detail' in evt && isPenumbraStateEventDetail(evt.detail));

export const isPenumbraStateEventDetail = (detail: unknown): detail is PenumbraStateEventDetail =>
  typeof detail === 'object' &&
  detail !== null &&
  'origin' in detail &&
  typeof detail.origin === 'string';

// utility type for SpecificEventTarget. any is required for type inference
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParametersTail<T extends (...args: any[]) => any> =
  Parameters<T> extends [unknown, ...infer TailParams] ? TailParams : never;

// like EventTarget, but restricts possible event types
interface SpecificEventTarget<SpecificTypeName extends string, SpecificEvent extends Event = Event>
  extends EventTarget {
  addEventListener: (
    type: SpecificTypeName,
    ...rest: ParametersTail<EventTarget['addEventListener']>
  ) => void;
  removeEventListener: (
    type: SpecificTypeName,
    ...rest: ParametersTail<EventTarget['removeEventListener']>
  ) => void;
  dispatchEvent: (event: SpecificEvent) => boolean;
}

export type PenumbraStateEventTarget = Omit<
  SpecificEventTarget<'penumbrastate', never>,
  'dispatchEvent'
>;
