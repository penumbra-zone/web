import { vi } from 'vitest';
import { mockEvent } from '../event.mock.js';
import { MockedPort } from './port.mock.js';

export class FakeChromeRuntimePort implements MockedPort {
  public readonly postMessage: MockedPort['postMessage'];
  public readonly disconnect: MockedPort['disconnect'];

  onDisconnect = mockEvent<chrome.runtime.PortDisconnectEvent>();
  onMessage = mockEvent<chrome.runtime.PortMessageEvent>();

  constructor(
    public readonly name: MockedPort['name'],
    public readonly sender: MockedPort['sender'],
    private other?: FakeChromeRuntimePort,
  ) {
    this.postMessage = vi.fn(this.postMessageImpl);
    this.disconnect = vi.fn(this.disconnectImpl);
    other?.associate(this);
  }

  public associate(other: FakeChromeRuntimePort): void {
    this.other ??= other;
  }

  private isAssociated(): MockedPort {
    if (!this.other) {
      throw new Error('Mock setup incomplete, not associated with another port.');
    }
    return this.other;
  }

  private disconnectImpl = (): void => {
    const counterpart = this.isAssociated();

    // clean up all listeners but counterpart's onDisconnect
    this.onDisconnect.listeners.clear();
    this.onMessage.listeners.clear();
    counterpart.onMessage.listeners.clear();

    // emit event on counterpart
    counterpart.onDisconnect.dispatch(counterpart);

    // disable new events
    this.postMessage.mockImplementation(throwDisconnectedPortError);
    this.disconnect.mockImplementation(() => void null);
    counterpart.postMessage.mockImplementation(throwDisconnectedPortError);
    counterpart.disconnect.mockImplementation(() => void null);

    // final listener cleanup
    counterpart.onDisconnect.listeners.clear();
  };

  private postMessageImpl = (message: unknown): void => {
    const other = this.isAssociated();

    other.onMessage.dispatch(
      // json stringify/parse is equivalent to the chrome runtime serialization
      JSON.parse(JSON.stringify(message)),
      other,
    );
  };
}

export const disconnectedPortErrorMessage = 'Attempting to use a disconnected port object';

export const isDisconnectedPortError = (
  error: unknown,
): error is Error & { message: typeof disconnectedPortErrorMessage } =>
  error instanceof Error && error.message === disconnectedPortErrorMessage;

export const throwDisconnectedPortError = () => {
  throw new Error(disconnectedPortErrorMessage);
};
