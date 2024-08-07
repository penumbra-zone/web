import { PenumbraEventTypeName, PenumbraEvent } from './event.js';

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

// custom event listener
export type PenumbraEventListener<T extends PenumbraEventTypeName = PenumbraEventTypeName> =
  SpecificEventListener<PenumbraEvent<T>>;

// event target with private dispatch
export type PenumbraEventTarget<T extends PenumbraEventTypeName = PenumbraEventTypeName> = Omit<
  SpecificEventTarget<T, PenumbraEvent<T>>,
  'dispatchEvent'
>;
