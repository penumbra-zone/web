/**
 * Basic comparison between two senders.
 * @returns true if checked fields match
 */
const compareSenders = (
  a: chrome.runtime.MessageSender,
  b: chrome.runtime.MessageSender,
): boolean =>
  a.tab?.id === b.tab?.id &&
  a.documentId === b.documentId &&
  a.frameId === b.frameId &&
  a.id === b.id &&
  a.nativeApplication === b.nativeApplication &&
  a.origin === b.origin &&
  a.tlsChannelId === b.tlsChannelId &&
  a.url === b.url;

/**
 * Assertion that two senders are identical.
 * @returns a is typeof b
 * @throws if either sender is falsy, or if {@link compareSenders} returns false
 */
export const assertMatchingSenders = (
  a?: chrome.runtime.MessageSender,
  b?: chrome.runtime.MessageSender,
): a is typeof b => {
  if (!a || !b) {
    throw new Error('Missing sender');
  } else if (!compareSenders(a, b)) {
    throw new Error('Sender mismatch');
  }
  return true;
};

/**
 * Assertion that two ports have matching senders.
 * @returns the first port parameter
 * @throws if {@link assertMatchingSenders} throws
 */
export const assertMatchingPortSenders = (
  p: chrome.runtime.Port,
  b?: chrome.runtime.Port,
): typeof p => {
  assertMatchingSenders(p.sender, b?.sender);
  return p;
};

/**
 * Type guard confirming a sender contains a truthy `origin` field.
 */
export const isSenderWithOrigin = (
  sender?: chrome.runtime.MessageSender,
): sender is chrome.runtime.MessageSender & { origin: string } => Boolean(sender?.origin);

/**
 * Assertion that a sender has an `origin` field.
 * @throws if the sender does not satisfy {@link isSenderWithOrigin}
 * @returns the type-narrowed sender
 */
export const assertSenderWithOrigin = (
  sender?: chrome.runtime.MessageSender,
): chrome.runtime.MessageSender & { origin: string } => {
  if (!isSenderWithOrigin(sender)) {
    throw new Error('Sender has no origin');
  }
  return sender;
};

/**
 * Type guard confirming a port's sender satisfies {@link isSenderWithOrigin}.
 */
export const isPortWithSenderOrigin = (
  port?: chrome.runtime.Port,
): port is chrome.runtime.Port & { sender: chrome.runtime.MessageSender & { origin: string } } =>
  isSenderWithOrigin(port?.sender);

/**
 * Assertion that a port's sender has an `origin` field.
 * @throws if the port's sender does not satisfy {@link isSenderWithOrigin}
 * @returns the type-narrowed port
 */
export const assertPortWithSenderOrigin = (
  port?: chrome.runtime.Port,
): chrome.runtime.Port & { sender: chrome.runtime.MessageSender & { origin: string } } => {
  if (!isPortWithSenderOrigin(port)) {
    throw new Error('Port sender has no origin');
  }
  return port;
};
