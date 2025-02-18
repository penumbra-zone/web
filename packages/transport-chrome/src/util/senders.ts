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

export const assertMatchingSenders = (
  a?: chrome.runtime.MessageSender,
  b?: chrome.runtime.MessageSender,
) => {
  if (!a || !b) {
    throw new Error('Missing sender');
  } else if (!compareSenders(a, b)) {
    throw new Error('Sender mismatch');
  }
};

export const isSenderWithOrigin = (
  sender?: chrome.runtime.MessageSender,
): sender is chrome.runtime.MessageSender & { origin: string } => Boolean(sender?.origin);

export const isPortWithSenderOrigin = (
  port?: chrome.runtime.Port,
): port is chrome.runtime.Port & { sender: chrome.runtime.MessageSender & { origin: string } } =>
  isSenderWithOrigin(port?.sender);

export const assertPortWithSenderOrigin = (
  port?: chrome.runtime.Port,
): chrome.runtime.Port & { sender: chrome.runtime.MessageSender & { origin: string } } => {
  if (!isPortWithSenderOrigin(port)) {
    throw new Error('Port sender has no origin');
  }
  return port;
};

export const assertSenderWithOrigin = (
  sender?: chrome.runtime.MessageSender,
): chrome.runtime.MessageSender & { origin: string } => {
  if (!isSenderWithOrigin(sender)) {
    throw new Error('Sender has no origin');
  }
  return sender;
};
