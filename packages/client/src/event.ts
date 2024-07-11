import { PenumbraInjectionState, PenumbraSymbol } from './index.js';

export interface PenumbraInjectionStateEventDetail {
  origin: string;
  state?: PenumbraInjectionState;
}

export class PenumbraInjectionStateEvent extends CustomEvent<PenumbraInjectionStateEventDetail> {
  constructor(injectionProviderOrigin: string, injectionState?: PenumbraInjectionState) {
    super('penumbrastate', {
      detail: {
        state: injectionState ?? window[PenumbraSymbol]?.[injectionProviderOrigin]?.state(),
        origin: injectionProviderOrigin,
      },
    });
  }
}

export const isPenumbraInjectionStateEvent = (evt: Event): evt is PenumbraInjectionStateEvent =>
  evt instanceof PenumbraInjectionStateEvent ||
  ('detail' in evt && isPenumbraInjectionStateEventDetail(evt.detail));

export const isPenumbraInjectionStateEventDetail = (
  detail: unknown,
): detail is PenumbraInjectionStateEventDetail =>
  typeof detail === 'object' &&
  detail !== null &&
  'origin' in detail &&
  typeof detail.origin === 'string';

// utility type for SpecificEventTarget. any and unused are required for type inference
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

export type PenumbraInjectionStateEventTarget = Omit<
  SpecificEventTarget<'penumbrastate', never>,
  'dispatchEvent'
>;
