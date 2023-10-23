import { beforeEach, describe, expect, test, vi } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';
import {
  ExtensionStorage,
  LocalStorageState,
  mockLocalExtStorage,
  mockSessionExtStorage,
} from '@penumbra-zone/storage';
import { MessageStatus, MessageType } from '@penumbra-zone/types';

vi.mock('@penumbra-zone/wasm-ts', () => ({}));

describe('Messages Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), localStorage));
  });

  test('the default is empty array', () => {
    expect(useStore.getState().messages.messages.length).toBe(0);
  });

  describe('changeStatusMessage()', () => {
    test('status can be changes to Approved', async () => {
      const msg = {
        origin: 'https://test',
        status: MessageStatus.PENDING,
        id: '1',
        type: MessageType.CONNECT,
      };
      await localStorage.set('messages', [msg]);
      const messages = useStore.getState().messages;
      useStore.setState({
        messages: {
          ...messages,
          messages: [msg],
        },
      });

      const messagesLocal = await localStorage.get('messages');
      expect(messagesLocal.length).toBe(1);
      expect(useStore.getState().messages.messages.length).toBe(1);

      await useStore.getState().messages.changeStatusMessage('1', MessageStatus.APPROVED);

      expect(useStore.getState().messages.messages[0]?.status).toBe(MessageStatus.APPROVED);

      const messagesLocalChanged = await localStorage.get('messages');
      expect(messagesLocalChanged[0]?.status).toBe(MessageStatus.APPROVED);
    });

    test('status can be changes to Rejected', async () => {
      const msg = {
        origin: 'https://test',
        status: MessageStatus.PENDING,
        id: '1',
        type: MessageType.CONNECT,
      };
      await localStorage.set('messages', [msg]);
      const messages = useStore.getState().messages;
      useStore.setState({
        messages: {
          ...messages,
          messages: [msg],
        },
      });

      const messagesLocal = await localStorage.get('messages');
      expect(messagesLocal.length).toBe(1);
      expect(useStore.getState().messages.messages.length).toBe(1);

      await useStore.getState().messages.changeStatusMessage('1', MessageStatus.REJECTED);

      expect(useStore.getState().messages.messages[0]?.status).toBe(MessageStatus.REJECTED);

      const messagesLocalChanged = await localStorage.get('messages');
      expect(messagesLocalChanged[0]?.status).toBe(MessageStatus.REJECTED);
    });
  });
});
