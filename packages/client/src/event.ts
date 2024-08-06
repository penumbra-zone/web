import { PenumbraState } from './state.js';

// like EventListener, but restricts possible event types
interface SpecificEventListener<T extends Event> extends EventListener {
  (evt: T): void;
}

// like EventTarget, but restricts possible event types
interface SpecificEventTarget<SpecificTypeName extends string, SpecificEvent extends Event = Event>
  extends EventTarget {
  addEventListener: (
    type: SpecificTypeName,
    listener: SpecificEventListener<SpecificEvent> | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined,
  ) => void;
  removeEventListener: (
    type: SpecificTypeName,
    listener: SpecificEventListener<SpecificEvent> | EventListenerObject | null,
    options?: boolean | EventListenerOptions | undefined,
  ) => void;
  dispatchEvent: (event: SpecificEvent) => boolean;
}

// utilities
type PenumbraEventTypeName = 'penumbrastate'; // may eventually contain more members
type PenumbraEventDetail<T extends PenumbraEventTypeName> = {
  penumbrastate: PenumbraStateEventDetail;
}[T];
type PenumbraEvent<T extends PenumbraEventTypeName> = CustomEvent<PenumbraEventDetail<T>>;

// custom event details
export interface PenumbraStateEventDetail {
  origin: string;
  state: PenumbraState;
  connected: boolean;
}

export const isPenumbraStateEventDetail = (detail: unknown): detail is PenumbraStateEventDetail =>
  typeof detail === 'object' &&
  detail !== null &&
  'origin' in detail &&
  typeof detail.origin === 'string' &&
  'state' in detail &&
  typeof detail.state === 'string' &&
  Object.keys(PenumbraState).includes(detail.state);

// custom event
//export class PenumbraStateEvent extends CustomEvent<PenumbraEventDetail<'penumbrastate'>> {
export class PenumbraStateEvent
  extends CustomEvent<PenumbraEventDetail<'penumbrastate'>>
  implements PenumbraEvent<'penumbrastate'>
{
  constructor(penumbraOrigin: string, penumbraState: PenumbraState, penumbraConnected: boolean) {
    const name = 'penumbrastate';
    const detail = {
      origin: penumbraOrigin,
      state: penumbraState,
      connected: penumbraConnected,
    };

    super(name, { detail });
  }
}

export const isPenumbraStateEvent = (evt: Event): evt is PenumbraStateEvent =>
  evt instanceof PenumbraStateEvent || ('detail' in evt && isPenumbraStateEventDetail(evt.detail));

// event listener
export type PenumbraEventListener<T extends PenumbraEventTypeName = PenumbraEventTypeName> =
  SpecificEventListener<PenumbraEvent<T>>;

// event target
export type PenumbraEventTarget<T extends PenumbraEventTypeName = PenumbraEventTypeName> = Omit<
  SpecificEventTarget<T, PenumbraEvent<T>>,
  'dispatchEvent'
>;
