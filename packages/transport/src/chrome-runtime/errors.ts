type ChromePortDisconnected = Error & { message: 'Attempting to use a disconnected port object' };

type AbortSubOnDisconnect<C extends string> = Error & {
  message: `Disconnecting sub ${C}`;
};

type AbortSubParentDisconnect<C extends string> = Error & {
  message: `Disconnecting client ${C}`;
};

export const isChromePortDisconnected = (e: unknown): e is ChromePortDisconnected =>
  e instanceof Error && e.message === 'Attempting to use a disconnected port object';

export const isAbortSubOnDisconnect = (
  e: unknown,
  s: string,
): e is AbortSubOnDisconnect<typeof s> =>
  e instanceof Error && e.message === `Disconnecting sub ${s}`;

export const isAbortSubParentDisconnect = (
  e: unknown,
  c: string,
): e is AbortSubParentDisconnect<typeof c> =>
  e instanceof Error && e.message === `Disconnecting client ${c}`;
