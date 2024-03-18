import { PraxConnectionReq, PraxConnectionRes } from '../message/prax';

// @ts-expect-error - ts can't understand the injected string
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PraxMessage<T = unknown> = { [PRAX]: T };

export type PraxRequestConnection = PraxMessage<PraxConnectionReq.Request>;
export type PraxConnectionPort = PraxMessage<MessagePort>;

export const isPraxMessageEvent = (ev: MessageEvent<unknown>): ev is MessageEvent<PraxMessage> =>
  isPraxMessageEventData(ev.data);

const isPraxMessageEventData = (p: unknown): p is PraxMessage =>
  typeof p === 'object' && p != null && PRAX in p;

export const isPraxRequestConnectionMessageEvent = (
  ev: MessageEvent<unknown>,
): ev is MessageEvent<PraxRequestConnection> =>
  // @ts-expect-error - ts can't understand the injected string
  isPraxMessageEventData(ev.data) && ev.data[PRAX] === PraxConnectionReq.Request;

export const isPraxRequestResponseMessageEvent = (
  ev: MessageEvent<unknown>,
): ev is MessageEvent => {
  if (!isPraxMessageEventData(ev.data)) return false;
  // @ts-expect-error - ts can't understand the injected string
  const status: unknown = ev.data[PRAX];
  return (
    status === PraxConnectionRes.Approved ||
    status === PraxConnectionRes.Denied ||
    status === PraxConnectionRes.NotLoggedIn
  );
};

export const isPraxConnectionPortMessageEvent = (
  ev: MessageEvent<unknown>,
): ev is MessageEvent<PraxConnectionPort> =>
  // @ts-expect-error - ts can't understand the injected string
  isPraxMessageEventData(ev.data) && ev.data[PRAX] instanceof MessagePort;
