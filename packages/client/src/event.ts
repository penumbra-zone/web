import { PenumbraState } from './state.js';

// custom event utility types
export type PenumbraEventTypeName = 'penumbrastate'; // may eventually contain more members
export type PenumbraEventDetail<T extends PenumbraEventTypeName> = {
  penumbrastate: {
    origin: string;
    state: PenumbraState;
  };
}[T];

// custom event type
export type PenumbraEvent<T extends PenumbraEventTypeName> = CustomEvent<PenumbraEventDetail<T>>;

// custom event tools
export const createPenumbraStateEvent = (penumbraOrigin: string, penumbraState: PenumbraState) =>
  new CustomEvent('penumbrastate', {
    detail: {
      origin: penumbraOrigin,
      state: penumbraState,
    },
  }) satisfies PenumbraEvent<'penumbrastate'>;

// custom event type guards
/** Type guard for `PenumbraStateEvent`. The `restrictOrigin` parameter is purely
 * informational - anyone may create an event with any origin label. */
export const isPenumbraStateEvent = (
  evt: unknown,
  restrictOrigin?: string,
): evt is PenumbraEvent<'penumbrastate'> =>
  evt instanceof CustomEvent && isPenumbraStateEventDetail(evt.detail, restrictOrigin);

export const isPenumbraStateEventDetail = (
  detail: unknown,
  restrictOrigin?: string,
): detail is PenumbraEventDetail<'penumbrastate'> =>
  typeof detail === 'object' &&
  detail !== null &&
  'origin' in detail &&
  typeof detail.origin === 'string' &&
  (!restrictOrigin || detail.origin === restrictOrigin) &&
  'state' in detail &&
  typeof detail.state === 'string' &&
  Object.keys(PenumbraState).includes(detail.state);
