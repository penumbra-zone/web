import { Prax } from '../../message/prax';

// @ts-expect-error - ts can't understand the injected string
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PraxMessage<T = unknown> = { [PRAX]: T };

export type PraxRequestConnection = PraxMessage<Prax.RequestConnection>;
export type PraxConnectionPort = PraxMessage<MessagePort>;

export const isPraxMessageEvent = (ev: MessageEvent<unknown>): ev is MessageEvent<PraxMessage> =>
  isPraxMessageEventData(ev.data);

const isPraxMessageEventData = (p: unknown): p is PraxMessage =>
  typeof p === 'object' && p != null && PRAX in p;

export const isPraxRequestConnectionMessageEvent = (
  ev: MessageEvent<unknown>,
): ev is MessageEvent<PraxRequestConnection> =>
  // @ts-expect-error - ts can't understand the injected string
  isPraxMessageEventData(ev.data) && ev.data[PRAX] === Prax.RequestConnection;

export const isPraxRequestResponseMessageEvent = (
  ev: MessageEvent<unknown>,
): ev is MessageEvent<Prax.ApprovedConnection | Prax.DeniedConnection> =>
  isPraxMessageEventData(ev.data) &&
  // @ts-expect-error - ts can't understand the injected string
  (ev.data[PRAX] === Prax.ApprovedConnection || ev.data[PRAX] === Prax.DeniedConnection);

export const isPraxConnectionPortMessageEvent = (
  ev: MessageEvent<unknown>,
): ev is MessageEvent<PraxConnectionPort> =>
  // @ts-expect-error - ts can't understand the injected string
  isPraxMessageEventData(ev.data) && ev.data[PRAX] instanceof MessagePort;
