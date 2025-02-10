import { MockedFunction, vi } from 'vitest';
import { MockedChromeEvent, mockEvent } from '../event.mock.js';
import {
  addTlsChannelId,
  crxSender,
  tabSender,
  throwDisconnectedPortError,
} from './channel.fixtures.js';

type MockSendersImpl = typeof mockSendersDefault;
type MockPortsImpl = typeof mockPortsDefault;

type MockedChromeConnect = (info?: ChromeConnectInfo) => MockedPort;

export interface MockedChannel {
  connect: MockedChromeConnect;
  onConnect: MockedChromeEvent<chrome.runtime.ExtensionConnectEvent>;
  mockSenders: MockedFunction<MockSendersImpl>;
  mockPorts: MockedFunction<MockPortsImpl>;
}

export type MockedPort = Omit<ChromePort, 'onDisconnect' | 'onMessage'> & {
  name: string;
  sender: ChromeSender;
  disconnect: MockedFunction<ChromePort['disconnect']>;
  postMessage: MockedFunction<ChromePort['postMessage']>;
  onDisconnect: MockedChromeEvent<chrome.runtime.PortDisconnectEvent>;
  onMessage: MockedChromeEvent<chrome.runtime.PortMessageEvent>;
  asPort: ChromePort;
};

/**
 * Create a pair of `chrome.runtime.MessageSender` objects, one for the caller
 * of `chrome.runtime.connect` and one for the listener of `chrome.runtime.onConnect`.
 *
 * @param connectInfo info passed to the `chrome.runtime.connect` call
 * @returns a pair of `chrome.runtime.MessageSender` objects
 */
export const mockSendersDefault = (
  connectInfo?: ChromeConnectInfo,
): {
  connectSender: ChromeSender;
  onConnectSender: ChromeSender;
} => ({
  connectSender: addTlsChannelId(tabSender, connectInfo),
  onConnectSender: crxSender,
});

/**
 * Create a pair of ports, one for the caller of `chrome.runtime.connect` and
 * one for the listener of `chrome.runtime.onConnect`.
 *
 * @param mockSenders function to create a pair of `chrome.runtime.MessageSender`
 * @param connectInfo info passed to the `chrome.runtime.connect` call
 * @param onConnectSender function to create a 'sender' representing the listener of `chrome.runtime.onConnect`
 */
export const mockPortsDefault = (
  mockSenders = mockSendersDefault,
  connectInfo?: ChromeConnectInfo,
): {
  connectPort: MockedPort;
  onConnectPort: MockedPort;
} => {
  const name = connectInfo?.name ?? 'mock-port-' + crypto.randomUUID();

  const { connectSender, onConnectSender } = mockSenders(connectInfo);

  const connectPort: MockedPort = {
    name,
    sender: onConnectSender,
    onDisconnect: mockEvent<chrome.runtime.PortDisconnectEvent>(),
    onMessage: mockEvent<chrome.runtime.PortMessageEvent>(),

    disconnect: vi.fn<[], void>(() => {
      onConnectPort.onDisconnect.dispatch(onConnectPort.asPort);
      connectPort.postMessage.mockImplementation(throwDisconnectedPortError);
      onConnectPort.postMessage.mockImplementation(throwDisconnectedPortError);
    }),

    postMessage: vi.fn<[unknown], void>(message =>
      onConnectPort.onMessage.dispatch(JSON.parse(JSON.stringify(message)), onConnectPort.asPort),
    ),

    get asPort() {
      return connectPort as unknown as ChromePort;
    },
  };

  const onConnectPort: MockedPort = {
    name,
    sender: connectSender,
    onDisconnect: mockEvent<chrome.runtime.PortDisconnectEvent>(),
    onMessage: mockEvent<chrome.runtime.PortMessageEvent>(),

    disconnect: vi.fn<[], void>(() => {
      const x = connectPort.onDisconnect;
      x.dispatch(connectPort.asPort);
      connectPort.postMessage.mockImplementation(throwDisconnectedPortError);
      onConnectPort.postMessage.mockImplementation(throwDisconnectedPortError);
    }),

    postMessage: vi.fn<[unknown], void>(message =>
      connectPort.onMessage.dispatch(JSON.parse(JSON.stringify(message)), connectPort.asPort),
    ),

    get asPort() {
      return onConnectPort as unknown as ChromePort;
    },
  };

  return { connectPort, onConnectPort };
};

/**
 * Call this to mock the chrome.runtime.connect and chrome.runtime.onConnect
 * APIs. To avoid clobbering other stubs, they aren't automatically injected.
 * You'll need to stub them like this:
 *
 * ```ts
 * vi.stubGlobal('chrome', {
 *   // collect all your `chrome` stubs in the same `stubGlobal` call
 *   runtime: { connect: mockConnect, onConnect: mockOnConnect },
 * });
 * ```
 *
 * You may only want to stub one end, and use the other in your test functions.
 *
 * Each set of mocks is scoped, and each `connect` call will create a new scoped
 * channel. If multiple mocks must be injected into the same global scope to
 * host different scripts simultaneously, you might manage it with an
 * intermediate layer of mocks.
 *
 * @returns a pair of mocks for chrome.runtime.connect and chrome.runtime.onConnect
 */
export const mockChannel = ({
  mockSenders = vi.fn(mockSendersDefault),
  mockPorts = vi.fn(mockPortsDefault),
} = {}): MockedChannel => {
  // create the chrome.runtime.onConnect{...} event manager
  const onConnect = mockEvent<chrome.runtime.ExtensionConnectEvent>();

  // create the chrome.runtime.connect(...) function
  const connect = vi.fn((info?: ChromeConnectInfo) => {
    const { connectPort, onConnectPort } = mockPorts(mockSenders, info);
    onConnect.dispatch(onConnectPort.asPort); // send the .onConnect listener's port
    return connectPort; // return the .connect() caller's port
  });

  return { connect, onConnect, mockSenders, mockPorts };
};
