import { jsonOptions, PenumbraService } from '@penumbra-zone/protobuf';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';

import { assertProviderManifest, assertProviderRecord } from './assert.js';
import { isPenumbraStateEvent, PenumbraStateEvent, PenumbraStateEventDetail } from './event.js';
import {
  getAllPenumbraManifests,
  getAvailableOrigin,
  getPenumbraGlobal,
  getPenumbraManifest,
  getPenumbraUnsafe,
} from './get.js';
import { PenumbraProvider } from './provider.js';
import { PenumbraState } from './state.js';
import {
  ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import { PenumbraManifest } from './manifest.js';

export class PenumbraClient {
  private readonly callbacks = new Set<(detail: PenumbraStateEventDetail) => void>();

  private provider?: PenumbraProvider;
  private port?: MessagePort;
  private serviceClients: Map<string, PromiseClient<PenumbraService>>;

  constructor() {
    this.serviceClients = new Map();
  }

  // public utility helpers

  /** Return a list of all present provider origins available in the page, or
   * `undefined` if no object is present at `window[Symbol.for('penumbra')]`
   * (indicating no providers installed). */
  public getProviders(): string[] {
    return Object.keys(getPenumbraGlobal());
  }

  /** Return a record of all present providers with pending fetches of their manifests. */
  public getProviderManifests(): Record<string, Promise<PenumbraManifest>> {
    return getAllPenumbraManifests();
  }

  /** Fetch manifest of a specific provider. */
  public getProviderManifest(providerOrigin: string): Promise<PenumbraManifest> {
    return getPenumbraManifest(providerOrigin);
  }

  /** Return boolean connection state of a specific provider. */
  public getProviderIsConnected(providerOrigin: string): boolean {
    return Boolean(getPenumbraUnsafe(providerOrigin)?.isConnected());
  }

  /** Return connection state enum of a specific provider. */
  public getProviderState(providerOrigin: string): PenumbraState | undefined {
    return getPenumbraUnsafe(providerOrigin)?.state();
  }

  // public methods

  /**
   * Asks users to approve the connection to a specific browser manifest URL.
   * If `manifest` argument is not provided, tries to connect to the first injected provider.
   */
  public async connect(requireOrigin?: string): Promise<void> {
    const providerOrigin = requireOrigin ?? getAvailableOrigin();

    await assertProviderManifest(providerOrigin);
    this.provider = assertProviderRecord(providerOrigin);

    const request = this.provider.connect().then(port => {
      this.port = port;
    });

    this.provider.addEventListener('penumbrastate', (evt: PenumbraStateEvent | Event) => {
      if (isPenumbraStateEvent(evt)) {
        void request.finally(() => this.callbacks.forEach(cb => cb(evt.detail)));
      }
    });

    return request;
  }

  /** Calls a `disconnect` method of the provider to prohibit future service calls */
  public async disconnect(): Promise<void> {
    const request = this.provider?.disconnect();
    this.port?.close();
    this.serviceClients.clear();
    return request;
  }

  /** Should synchronously return the present connection state.
   * - `true` indicates active connection.
   * - `false` indicates inactive connection.
   */
  public isConnected(): boolean {
    return this.provider?.isConnected() ?? false;
  }

  /** Synchronously return present injection state: `'Pending' | 'Connected' | 'Disconnected'`  */
  public state(): PenumbraState {
    return this.provider?.state() ?? PenumbraState.Disconnected;
  }

  /** Provides a simplified callback interface to `PenumbraStateEvent`s. */
  public onConnectionChange(
    listener: (detail: PenumbraStateEventDetail) => void,
    removeListener?: AbortSignal,
  ) {
    if (removeListener?.aborted) {
      this.callbacks.delete(listener);
    } else {
      removeListener?.addEventListener('abort', () => this.callbacks.delete(listener));
      this.callbacks.add(listener);
    }
  }

  /**
   * Returns a new or re-used `PromiseClient<T>` for a specific `PenumbraService`.
   * Use it to fetch the account or blockchain related data.
   */
  public service<T extends PenumbraService>(
    service: T,
    options?: Omit<ChannelTransportOptions, 'getPort'>,
  ): PromiseClient<T> {
    const existingClient = this.serviceClients.get(service.typeName);

    if (existingClient) {
      // TODO: avoid type cast
      return existingClient as PromiseClient<T>;
    } else {
      const createdClient = createPromiseClient(
        service,
        createChannelTransport({
          getPort: () => Promise.resolve(this.port!),
          ...options,
          jsonOptions,
        }),
      );
      this.serviceClients.set(service.typeName, createdClient);
      return createdClient;
    }
  }
}

/**
 * Creates a new `PenumbraClient` instance. Use it to connect to a certain provider,
 * listen to connection changes, call Penumbra services,
 */
export const createPenumbraClient = () => new PenumbraClient();
