import { Message, MessageStatus } from '@penumbra-zone/types';
import { AllSlices, SliceCreator } from '.';
import { ExtensionStorage, LocalStorageState } from '@penumbra-zone/storage';

export interface MessagesSlice {
  messages: Message[];
  changeStatusMessage: (id: string, status: MessageStatus) => Promise<void>;
}

export const createMessagesSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<MessagesSlice> =>
  (set, get) => {
    return {
      messages: [],
      changeStatusMessage: async (id, status) => {
        const messages = [...get().messages.messages];

        const currentMsg = messages.find(msg => msg.id === id);

        if (!currentMsg) throw new Error(`Message with ${id} doesn't exist`);

        const updatedMsg = {
          ...currentMsg,
          status,
        };

        const updatedMsgIndex = messages.findIndex(msg => msg.id === id);

        // Replace item at index
        messages[updatedMsgIndex] = updatedMsg;

        set(state => {
          state.messages.messages = messages;
        });

        await local.set('messages', messages);
      },
    };
  };

export const messagesSelector = (state: AllSlices) => state.messages;
