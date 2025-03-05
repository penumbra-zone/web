import { MockSendersImpl } from './message-sender.mock.js';

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

/**
 * Create a flipped `MockSendersImpl` based on a provided `MockSendersImpl`.
 * Useful if you're mocking channels in two directions.
 *
 * @param mockSendersImpl the implementation to flip
 */
export const flipSenders =
  (mockSendersImpl: MockSendersImpl): MockSendersImpl =>
  (...params) => {
    const { onConnectSender, connectSender } = mockSendersImpl(...params);
    return { connectSender: onConnectSender, onConnectSender: connectSender };
  };

export const addTlsChannelIdDefault = (senderBase: chrome.runtime.MessageSender) => ({
  ...senderBase,
  tlsChannelId: 'mock-tls-channel-id',
});

export type AddTlsChannelIdFn = (
  baseSender: chrome.runtime.MessageSender,
) => chrome.runtime.MessageSender & { tlsChannelId: string };
