import { type MockedFunction, vi } from 'vitest';
import {
  tabSender,
  crxSender,
  addTlsChannelIdDefault,
  type AddTlsChannelIdFn,
} from './message-sender.fixtures.js';

export type MockSendersImpl = (
  connectInfo?: chrome.runtime.ConnectInfo,
  utils?: {
    addTlsChannelId?: MockedFunction<AddTlsChannelIdFn>;
  },
) => MockedSendersPair;

export interface MockedSendersPair {
  connectSender: chrome.runtime.MessageSender;
  onConnectSender: chrome.runtime.MessageSender;
}

/**
 * Create a pair of `chrome.runtime.MessageSender` objects, one for the caller
 * of `chrome.runtime.connect` and one for the listener of `chrome.runtime.onConnect`.
 *
 * @param connectInfo info passed to the `chrome.runtime.connect` call
 * @param addTlsChannelId function to use when `connectInfo.includeTlsChannelId` is true
 * @returns a pair of `chrome.runtime.MessageSender` objects
 */
export const mockSendersDefault: MockSendersImpl = (
  connectInfo,
  { addTlsChannelId = vi.fn(addTlsChannelIdDefault) } = {},
) => ({
  connectSender: connectInfo?.includeTlsChannelId ? addTlsChannelId(tabSender) : tabSender,
  onConnectSender: crxSender,
});
