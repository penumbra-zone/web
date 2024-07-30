import { assertProviderManifest, assertProviderRecord } from './assert.js';
import { PenumbraProviderNotConnectedError } from './error.js';
import { PenumbraStateEventDetail, PenumbraStateEvent, isPenumbraStateEvent } from './event.js';
import { availableOrigin } from './get.js';
import { PenumbraProvider } from './provider.js';
import { PenumbraState } from './state.js';

export interface IPenumbraClient {
  /**
   * Asks users to approve the connection to a specific browser manifest URL.
   * If `manifest` argument is not provided, tries to connect to the first injected provider.
   * Returns the manifest url of the connected provider, or an error
   */
  readonly connect: (providerUrl?: string) => Promise<string>;
  /** Reexports the `disconnect` function from injected provider */
  readonly disconnect: () => Promise<void>;
  /** Reexports the `isConnected` function from injected provider  */
  readonly isConnected: () => boolean | undefined;
  /** Reexports the `state` function from injected provider */
  readonly getState: () => PenumbraState;
  /** Provides a simplified callback interface to `PenumbraStateEvent`s. */
  readonly onConnectionChange: (cb: (connection: PenumbraStateEventDetail) => void) => void;
  /**
   * Needed for custom service connections if `getService` is not enough.
   * For example, might be useful for React wrapper of the `client` package
   */
  readonly getMessagePort: () => MessagePort;
}

export class PenumbraClient implements IPenumbraClient {
  private readonly callbacks = new Set<(detail: PenumbraStateEventDetail) => void>();

  private origin?: string;
  private provider?: PenumbraProvider;
  public port?: MessagePort;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    /* noop by spec */
  }

  private assertProvider() {
    if (!this.provider) {
      throw new PenumbraProviderNotConnectedError(this.origin);
    }
    return this.provider;
  }

  private assertPort() {
    if (!this.port) {
      throw new PenumbraProviderNotConnectedError(this.origin);
    }
    return this.port;
  }

  public async connect(requireOrigin?: string): Promise<string> {
    const providerOrigin = requireOrigin ?? availableOrigin();

    await assertProviderManifest(providerOrigin);

    this.origin = providerOrigin;
    this.provider = assertProviderRecord(providerOrigin);

    const request = this.provider.connect().then(port => {
      this.port = port;
    });

    this.provider.addEventListener('penumbrastate', (evt: PenumbraStateEvent | Event) => {
      if (isPenumbraStateEvent(evt)) {
        void request.finally(() => this.callbacks.forEach(cb => cb(evt.detail)));
      }
    });

    await request;

    return this.provider.manifest;
  }

  public disconnect() {
    return this.assertProvider().disconnect();
  }

  public isConnected() {
    return this.provider?.isConnected() ?? false;
  }

  public getState() {
    return this.assertProvider().state();
  }

  public onConnectionChange(callback: (detail: PenumbraStateEventDetail) => void) {
    this.callbacks.add(callback);
  }

  public getMessagePort() {
    return this.assertPort();
  }
}
