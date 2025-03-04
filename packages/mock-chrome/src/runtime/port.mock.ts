import { MockedFunction, vi } from 'vitest';
import { MockedChromeEvent } from '../event.mock.js';
import { mockSendersDefault, type MockSendersImpl } from './message-sender.mock.js';
import { FakeChromeRuntimePort } from './port.fixtures.js';

export interface MockedPort extends chrome.runtime.Port {
  name: string;
  sender: chrome.runtime.MessageSender;
  disconnect: MockedFunction<chrome.runtime.Port['disconnect']>;
  postMessage: MockedFunction<chrome.runtime.Port['postMessage']>;
  onDisconnect: MockedChromeEvent<chrome.runtime.PortDisconnectEvent>;
  onMessage: MockedChromeEvent<chrome.runtime.PortMessageEvent>;
}

export type MockPortsImpl = (
  connectInfo: chrome.runtime.ConnectInfo,
  utils?: {
    mockSenders?: MockedFunction<MockSendersImpl>;
  },
) => MockedPortPair;

export interface MockedPortPair {
  connectPort: MockedPort;
  onConnectPort: MockedPort;
}

/**
 * Create a pair of ports, one for the caller of `chrome.runtime.connect` and
 * one for the listener of `chrome.runtime.onConnect`.
 *
 * @param connectInfo info passed to the `chrome.runtime.connect` call
 * @param mockSenders function to create a pair of `chrome.runtime.MessageSender`
 * @param addTlsChannelId function to use when `connectInfo.includeTlsChannelId` is true
 */
export const mockPortsDefault: MockPortsImpl = (
  connectInfo: chrome.runtime.ConnectInfo,
  { mockSenders = vi.fn(mockSendersDefault) } = {},
): MockedPortPair => {
  const name = connectInfo.name ?? 'mock-port-' + crypto.randomUUID();

  const { connectSender, onConnectSender } = mockSenders(connectInfo);

  const connectPort = new FakeChromeRuntimePort(name, onConnectSender);
  const onConnectPort = new FakeChromeRuntimePort(name, connectSender, connectPort);

  return { connectPort, onConnectPort };
};
