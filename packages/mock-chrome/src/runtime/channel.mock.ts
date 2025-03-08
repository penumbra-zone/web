import { type MockedFunction, vi } from 'vitest';
import { type MockedChromeEvent, mockEvent } from '../event.mock.js';
import { mockSendersDefault, type MockSendersImpl } from './message-sender.mock.js';
import { type MockedPort, mockPortsDefault, type MockPortsImpl } from './port.mock.js';

export { flipSenders } from './message-sender.fixtures.js';
export type { MockedSendersPair } from './message-sender.mock.js';
export type { MockedPortPair } from './port.mock.js';

export interface MockedChannel {
  connect: MockedFunction<(info?: chrome.runtime.ConnectInfo) => MockedPort>;
  onConnect: MockedChromeEvent<chrome.runtime.ExtensionConnectEvent>;
  mockSenders: MockedFunction<MockSendersImpl>;
  mockPorts: MockedFunction<MockPortsImpl>;
}

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
 * const channel2 = mockChannel({ mockSenders: vi.fn(flipSenders(mySendersImpl)) });
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
  // create the chrome.runtime.onConnect event manager
  const onConnect = mockEvent<chrome.runtime.ExtensionConnectEvent>();

  // create the chrome.runtime.connect function
  const connect = vi.fn((info: chrome.runtime.ConnectInfo = {}) => {
    const { connectPort, onConnectPort } = mockPorts(info, { mockSenders });

    onConnect.dispatch(onConnectPort);
    return connectPort;
  });

  return { connect, onConnect, mockSenders, mockPorts };
};
