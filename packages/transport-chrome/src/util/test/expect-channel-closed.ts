import type { TransportMessage } from '@penumbra-zone/transport-dom/messages';
import type { MockedPort } from '@repo/mock-chrome/runtime/port.mock';
import { expect } from 'vitest';

/**
 * Clear mock states, then attempt to post a message through the channel.
 * Expects the message should not arrive after 50ms.
 */
export const expectChannelClosed = async (
  sessionPort: MockedPort,
  extPort: MockedPort,
  domPort: MessagePort,
) => {
  const messageAfterDisconnect: TransportMessage = {
    message: 'going nowhere',
    requestId: '123',
  };
  sessionPort.postMessage.mockClear();
  extPort.onMessage.dispatch.mockClear();

  // try to send a message again.
  domPort.postMessage(messageAfterDisconnect);

  // can't wait for the absence of an event, so just give it a moment
  await new Promise(resolve => void setTimeout(resolve, 50));

  // the messages don't get through.
  expect(sessionPort.postMessage).not.toHaveBeenCalled();
  expect(extPort.onMessage.dispatch).not.toHaveBeenCalled();
};
