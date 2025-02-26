export const exampleOrigin = 'https://example.com';
export const crxOrigin = 'chrome-extension://mockextensionid';

export const tabSender: chrome.runtime.MessageSender = {
  documentId: 'a unique string',
  documentLifecycle: 'active',
  frameId: 0,
  origin: exampleOrigin,
  tlsChannelId: 'very random string',
  url: exampleOrigin + '/',
  tab: {
    active: true,
    autoDiscardable: false,
    discarded: false,
    groupId: -1,
    highlighted: false,
    id: 1337,
    incognito: false,
    index: 1,
    pinned: false,
    selected: true,
    url: exampleOrigin + '/',
    windowId: 1,
  },
};

export const crxSender: chrome.runtime.MessageSender = {
  id: 'mock-extension-id',
  origin: crxOrigin,
  url: crxOrigin + '/background.js',
};

export const throwDisconnectedPortError = () => {
  throw new Error('Attempting to use a disconnected port object');
};

export const addTlsChannelId = (
  senderBase: chrome.runtime.MessageSender,
  { includeTlsChannelId }: chrome.runtime.ConnectInfo = {},
) => ({
  ...senderBase,
  tlsChannelId: includeTlsChannelId ? 'mock-tls-channel-id' : undefined,
});
