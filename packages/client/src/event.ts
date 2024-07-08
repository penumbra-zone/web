import { PenumbraInjectionState, PenumbraSymbol } from '.';

export class PenumbraInjectionStateEvent extends CustomEvent<{
  origin: string;
  state?: PenumbraInjectionState;
}> {
  constructor(injectionProviderOrigin: string, injectionState?: PenumbraInjectionState) {
    super('penumbrastate', {
      detail: {
        state: injectionState ?? window[PenumbraSymbol]?.[injectionProviderOrigin]?.state(),
        origin: injectionProviderOrigin,
      },
    });
  }
}
