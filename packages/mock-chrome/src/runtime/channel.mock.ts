import { MockedFunction, vi } from 'vitest';
import { MockedChromeEvent, mockEvent } from '../event.mock.js';
import {
  addTlsChannelId,
  crxSender,
  tabSender,
  throwDisconnectedPortError,
} from './channel.fixtures.js';

export type MockConnectImpl = (info?: chrome.runtime.ConnectInfo) => MockedPort;

export type MockSendersImpl = (info?: chrome.runtime.ConnectInfo) => {
  connectSender: chrome.runtime.MessageSender;
  onConnectSender: chrome.runtime.MessageSender;
};

export type MockPortsImpl = (
  mockSenders: MockedFunction<MockSendersImpl>,
  connectInfo?: chrome.runtime.ConnectInfo,
) => {
  connectPort: MockedPort;
  onConnectPort: MockedPort;
};

export interface MockedChannel {
  connect: MockedFunction<MockConnectImpl>;
  onConnect: MockedChromeEvent<chrome.runtime.ExtensionConnectEvent>;
  mockSenders: MockedFunction<MockSendersImpl>;
  mockPorts: MockedFunction<MockPortsImpl>;
}

export interface MockedPort extends chrome.runtime.Port {
  name: string;
  sender: chrome.runtime.MessageSender;
  disconnect: MockedFunction<chrome.runtime.Port['disconnect']>;
  postMessage: MockedFunction<chrome.runtime.Port['postMessage']>;
  onDisconnect: MockedChromeEvent<chrome.runtime.PortDisconnectEvent>;
  onMessage: MockedChromeEvent<chrome.runtime.PortMessageEvent>;
}

/**
 * Create a pair of `chrome.runtime.MessageSender` objects, one for the caller
 * of `chrome.runtime.connect` and one for the listener of `chrome.runtime.onConnect`.
 *
 * @param connectInfo info passed to the `chrome.runtime.connect` call
 * @returns a pair of `chrome.runtime.MessageSender` objects
 */
export const mockSendersDefault: MockSendersImpl = (
  connectInfo?: chrome.runtime.ConnectInfo,
): {
  connectSender: chrome.runtime.MessageSender;
  onConnectSender: chrome.runtime.MessageSender;
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
export const mockPortsDefault: MockPortsImpl = (
  mockSenders = mockSendersDefault,
  connectInfo?: chrome.runtime.ConnectInfo,
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
      // nothing is going to arrive anymore
      connectPort.onDisconnect.listeners.clear();
      connectPort.onMessage.listeners.clear();

      onConnectPort.onDisconnect.dispatch(onConnectPort);
      connectPort.postMessage.mockImplementation(throwDisconnectedPortError);
      connectPort.disconnect.mockImplementation(() => void null);
      onConnectPort.postMessage.mockImplementation(throwDisconnectedPortError);
      onConnectPort.disconnect.mockImplementation(() => void null);

      // after activation, clean up counterpart listeners
      onConnectPort.onDisconnect.listeners.clear();
      onConnectPort.onMessage.listeners.clear();
    }),

    postMessage: vi.fn<[unknown], void>(message =>
      onConnectPort.onMessage.dispatch(JSON.parse(JSON.stringify(message)), onConnectPort),
    ),
  };

  const onConnectPort: MockedPort = {
    name,
    sender: connectSender,
    onDisconnect: mockEvent<chrome.runtime.PortDisconnectEvent>(),
    onMessage: mockEvent<chrome.runtime.PortMessageEvent>(),

    disconnect: vi.fn<[], void>(() => {
      // nothing is going to arrive anymore
      onConnectPort.onDisconnect.listeners.clear();
      onConnectPort.onMessage.listeners.clear();

      connectPort.onDisconnect.dispatch(connectPort);
      connectPort.postMessage.mockImplementation(throwDisconnectedPortError);
      connectPort.disconnect.mockImplementation(() => void null);
      onConnectPort.postMessage.mockImplementation(throwDisconnectedPortError);
      onConnectPort.disconnect.mockImplementation(() => void null);

      // after activation, clean up counterpart listeners
      connectPort.onDisconnect.listeners.clear();
      connectPort.onMessage.listeners.clear();
    }),

    postMessage: vi.fn<[unknown], void>(message =>
      connectPort.onMessage.dispatch(JSON.parse(JSON.stringify(message)), connectPort),
    ),
  };

  return { connectPort, onConnectPort };
};

/**
 * Mock the `chrome.runtime.connect` and `chrome.runtime.onConnect` APIs. To
 * avoid clobbering other stubs, they aren't automatically injected.
 *
 * You probably only want to stub one end, and use the other end in your test
 * functions. If you need bi-directional connections, mock two channels.
 *
 * You'll need to stub them like this:
 *
 * ```ts
 * const channel1 = mockChannel({ mockSenders: vi.fn(mySendersImpl) });
 * const channel2 = mockChannel({ mockSenders: vi.fn(flipSendersImpl(mySendersImpl)) });
 * vi.stubGlobal('chrome', {
 *   // collect all your `chrome` stubs in the same `stubGlobal` call
 *   runtime: { connect: channel1.connect, onConnect: channel2.onConnect },
 * });
 * ```
 *
 * If you're just mocking one direction, you can leave out the `mockSenders`
 * option and it will use the default senders implementation, in which the
 * extension listens for `onConnect`.
 *
 * Each set of mocks is scoped, and each `connect` call will create a new scoped
 * channel. If multiple mocks must be injected into the same global scope to
 * host different scripts simultaneously, you might manage it with an
 * intermediate layer of mocks.
 *
 * @returns a pair of mocks for `chrome.runtime.connect` and `chrome.runtime.onConnect`
 */
export const mockChannel = ({
  mockSenders = vi.fn(mockSendersDefault),
  mockPorts = vi.fn(mockPortsDefault),
} = {}): MockedChannel => {
  // create the chrome.runtime.onConnect{...} event manager
  const onConnect = mockEvent<chrome.runtime.ExtensionConnectEvent>();

  // create the chrome.runtime.connect(...) function
  const connect = vi.fn((info?: chrome.runtime.ConnectInfo) => {
    const { connectPort, onConnectPort } = mockPorts(mockSenders, info);
    // send the .onConnect listener's port
    onConnect.dispatch(onConnectPort);
    return connectPort; // return the .connect() caller's port
  });

  return { connect, onConnect, mockSenders, mockPorts };
};

export const flipSendersImpl =
  (mockSendersImpl: MockSendersImpl): MockSendersImpl =>
  (...i) => {
    const { connectSender, onConnectSender } = mockSendersImpl(...i);
    return { connectSender: onConnectSender, onConnectSender: connectSender };
  };
