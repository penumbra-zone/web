import { PenumbraInjectionState, PenumbraSymbol } from '.';

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
