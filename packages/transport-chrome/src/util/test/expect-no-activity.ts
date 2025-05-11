import type { MockedPort } from '@repo/mock-chrome/runtime/port.mock';
import { expect, Mock } from 'vitest';

export const expectNoActivity = (
  sessionPort: MockedPort,
  extPort: MockedPort,
  domMessageHandler?: Mock<[MessageEvent<unknown>], void>,
) => {
  // not disconnected yet, no messages yet
  expect(domMessageHandler).not.toHaveBeenCalled();
  expect(extPort.onDisconnect.dispatch).not.toHaveBeenCalled();
  expect(extPort.onMessage.dispatch).not.toHaveBeenCalled();
  expect(sessionPort.onDisconnect.dispatch).not.toHaveBeenCalled();
  expect(sessionPort.onMessage.dispatch).not.toHaveBeenCalled();
};
