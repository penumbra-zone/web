import { PraxConnection } from './message/prax';

// @ts-expect-error - ts can't understand the injected string
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PraxMessage<T = unknown> = { [PRAX]: T };

export const isPraxMessageEvent = (ev: MessageEvent<unknown>): ev is MessageEvent<PraxMessage> =>
  isPraxMessageEventData(ev.data);

const isPraxMessageEventData = (p: unknown): p is PraxMessage =>
  typeof p === 'object' && p != null && PRAX in p;

export const isPraxRequestMessageEvent = (
  ev: MessageEvent<unknown>,
): ev is MessageEvent<PraxMessage<PraxConnection.Request>> =>
  // @ts-expect-error - ts can't understand the injected string
  isPraxMessageEventData(ev.data) && ev.data[PRAX] === PraxConnection.Request;

export const isPraxFailureMessageEvent = (
  ev: MessageEvent<unknown>,
): ev is MessageEvent<PraxMessage<PraxConnection.Denied | PraxConnection.NeedsLogin>> => {
  if (!isPraxMessageEventData(ev.data)) return false;
  // @ts-expect-error - ts can't understand the injected string
  const status = ev.data[PRAX] as unknown;
  return status === PraxConnection.Denied || status === PraxConnection.NeedsLogin;
};

export const isPraxPortMessageEvent = (
  ev: MessageEvent<unknown>,
): ev is MessageEvent<PraxMessage<MessagePort>> =>
  // @ts-expect-error - ts can't understand the injected string
  isPraxMessageEventData(ev.data) && ev.data[PRAX] instanceof MessagePort;
