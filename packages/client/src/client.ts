import { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient, PromiseClient, Transport } from '@connectrpc/connect';
import { jsonOptions } from '@penumbra-zone/protobuf';
import {
  ChannelTransportOptions,
  createChannelTransport,
} from '@penumbra-zone/transport-dom/create';
import { assertProviderConnected, assertProviderRecord } from './assert.js';
import { createPenumbraStateEvent, isPenumbraStateEvent, PenumbraEventDetail } from './event.js';
import { PenumbraEventListener } from './event-listener.js';
import {
  getPenumbraGlobalUnsafe,
  getPenumbraManifest,
  getPenumbraManifests,
  getPenumbraUnsafe,
} from './get.js';
import { PenumbraManifest } from './manifest.js';
import { PenumbraProvider } from './provider.js';
import { PenumbraState } from './state.js';
import { PenumbraProviderNotAvailableError } from './error.js';

const isPromiseClientOfServiceType = <T extends ServiceType>(
  s: T,
  pc?: PromiseClient<ServiceType>,
): pc is PromiseClient<T> => {
  const expectMethods = Object.keys(s.methods);
  const actualMethods = Object.keys(pc ?? {});
  return expectMethods.every(method => actualMethods.includes(method));
};

const isLegacyProvider = (
  provider: PenumbraProvider,
): provider is PenumbraProvider & { request: () => Promise<void> } => 'request' in provider;

interface PenumbraClientOptions {
  /** Custom options for this client's `Transport`. */
  transportOptions: Omit<ChannelTransportOptions, 'getPort'>;
}

interface PenumbraClientConnection {
  port: Promise<MessagePort>;
  transport: Transport;
}

interface PenumbraClientAttachment {
  origin: string;
  provider: PenumbraProvider;
  confirmManifest: Promise<PenumbraManifest>;
  manifest?: PenumbraManifest;
}

/**
 * `PenumbraClient` is intended to be the 'entry' to the collection of service
 * APIs for dapp developers inspecting or interacting with a user's Penumbra
 * chain state.
 *
 * PenumbraClient static methods will allow you to
 *
 * - inspect available providers
 * - verify the provider is present
 * - choose a provider to connect
 *
 * If you're developing a dapp using penumbra, you should likely:
 *
 * - gate penumbra features, if no providers are installed
 * - display a button to initiate connection, if no providers are connected
 * - display a modal choice, if multiple providers are present
 *
 * When you've selected a provider, you can provide its origin URI to
 * `createPenumbraClient` or `new PenumbraClient`. This will create a client
 * attached to that provider, and you can then:
 *
 * - request permission to connect and create an active connection with `connect`
 * - access the provider's services with `service` and a `ServiceType` parameter
 * - release your permissions with `disconnect`
 */
export class PenumbraClient {
  // static features

  /** When using the `PenumbraClient` constructor directly, this is the default
   * value of the options parameter.
   *
   * When using `createPenumbraClient`, this object is spread into the options
   * parameter of the client constructor before the caller's options parameter.
   */
  public static readonly defaultOptions: PenumbraClientOptions = {
    transportOptions: { jsonOptions },
  };

  /** Return the record of all present providers available in the page. */
  public static getProviders(): Record<string, PenumbraProvider> {
    return getPenumbraGlobalUnsafe() ?? {};
  }

  /** Return a record of all present providers, and fetch their manifests. */
  public static getProviderManifests(): Record<string, Promise<PenumbraManifest>> {
    return getPenumbraGlobalUnsafe() ? getPenumbraManifests() : {};
  }

  /** Fetch manifest of a specific provider, or return `undefined` if the
   * provider is not present. */
  public static getProviderManifest(providerOrigin: string): Promise<PenumbraManifest> | undefined {
    return getPenumbraUnsafe(providerOrigin) && getPenumbraManifest(providerOrigin);
  }

  /** Return boolean connection state of a specific provider, or `undefined` if
   * the provider is not present. */
  public static isProviderConnected(providerOrigin: string): boolean | undefined {
    return getPenumbraUnsafe(providerOrigin)?.isConnected();
  }

  /** Return connection state enum of a specific provider, or `undefined` if the
   * provider is not present. */
  public static getProviderState(providerOrigin: string): PenumbraState | undefined {
    return getPenumbraUnsafe(providerOrigin)?.state();
  }

  // instance features

  private readonly serviceClients: Map<ServiceType['typeName'], PromiseClient<ServiceType>>;
  private readonly stateListeners: Set<(detail: PenumbraEventDetail<'penumbrastate'>) => void>;
  private readonly providerEventListener: PenumbraEventListener;

  private connection?: PenumbraClientConnection;
  private attached?: PenumbraClientAttachment;

  /** Construct a client instance but take no specific action. Will immediately
   * attach to a specified provider, or remain unconfigured. */
  constructor(
    /** A provider origin may be provided during client construction to
     * immediately attach. If not, this client will not be able to connect or
     * report state information until `attach` is called to specify a provider
     * origin. */
    providerOrigin?: string | undefined,
    private readonly options = PenumbraClient.defaultOptions,
  ) {
    this.serviceClients = new Map();
    this.stateListeners = new Set();
    this.providerEventListener = evt => {
      if (this.attached?.origin && isPenumbraStateEvent(evt, this.attached.origin)) {
        this.stateListeners.forEach(listener => listener(evt.detail));
      }
    };
    if (providerOrigin) {
      void this.attach(providerOrigin);
    }
  }

  /**
   * It is recommended to construct clients with a specific provider origin. If
   * you didn't do that, and you're working with an unconfigured client, you can
   * configure it with `attach`.
   *
   * A client may only be attached once. A client must be attached to connect.
   *
   * Presence of the public `origin` field can confirm a client instance is
   * attached.
   *
   * If called repeatedly with a matching provider, `attach` is a no-op. If
   * called repeatedly with a different provider, `attach` will throw.
   */
  public async attach(providerOrigin: string): Promise<PenumbraManifest> {
    if (!this.attached) {
      this.attached ??= this.createAttached(providerOrigin);
      await this.attached.confirmManifest;

      // callbacks may already be listening for a transition out of the client's
      // unconfigured state, so emit a synthetic event reflecting the state of
      // the new provider.
      this.providerEventListener(
        createPenumbraStateEvent(this.attached.origin, this.attached.provider.state()),
      );
      this.attached.provider.addEventListener('penumbrastate', this.providerEventListener);
    }

    if (this.attached.origin !== providerOrigin) {
      throw new Error('Client already attached to a different provider.');
    }

    return this.attached.confirmManifest;
  }

  /** Attempt to connect to the attached provider, or attach and then connect to
   * the provider specified by parameter.
   *
   * Presence of the public `connected` field can confirm the client is
   * connected or can connect.  The public `transport` field can confirm the
   * client possesses an active connection.
   *
   * May reject with an enumerated `PenumbraRequestFailure`.
   */
  public async connect(providerOrigin?: string): Promise<void> {
    if (providerOrigin) {
      await this.attach(providerOrigin);
    }
    this.connection ??= this.createConnection();
    await this.connection.port;
  }

  /** Call `disconnect` on the associated provider to release connection
   * approval, and destroy any present connection. If there is no present
   * configuration, returns `undefined`. */
  public async disconnect(): Promise<void> {
    const request = this.attached?.provider.disconnect();
    this.destroyConnection();
    await request;
  }

  /** Return a `PromiseClient<T>` for some `T extends ServiceType`, using this
   * client's internal `Transport`. If you call this method before this client
   * is attached, this method will throw.
   *
   * You should also prefer to call this method *after* this client's connection
   * has succeeded.
   *
   * If you call this method before connection success is resolved, a connection
   * will be initiated if necessary but will not be awaited (as this is a
   * synchronous method). If a connection initated this way is rejected, or does
   * not resolve within the `defaultTimeoutMs` of this client's
   * `options.transport`, requests made with the returned `PromiseClient<T>`
   * will throw.
   */
  public service<T extends ServiceType>(service: T): PromiseClient<T> {
    const serviceClient =
      this.serviceClients.get(service.typeName) ??
      this.serviceClients
        .set(service.typeName, createPromiseClient(service, this.assertConnection().transport))
        .get(service.typeName);
    if (!isPromiseClientOfServiceType(service, serviceClient)) {
      throw new Error(`Detected invalid PromiseClient for ${service.typeName}`, {
        cause: { service, client: serviceClient },
      });
    }
    return serviceClient;
  }

  /** Simplified callback interface to the `EventTarget` interface of the
   * associated provider. */
  public onConnectionStateChange(
    listener: (detail: PenumbraEventDetail<'penumbrastate'>) => void,
    removeListener?: AbortSignal,
  ) {
    if (removeListener?.aborted) {
      this.stateListeners.delete(listener);
    } else {
      removeListener?.addEventListener('abort', () => this.stateListeners.delete(listener));
      this.stateListeners.add(listener);
    }
  }

  // public fields requiring connection

  /** The promised `MessagePort` returned from this client's provider. */
  public get port(): Promise<MessagePort> | undefined {
    return this.connection?.port;
  }

  /** The ConnectRPC `Transport` created by this client's connection. */
  public get transport(): Transport | undefined {
    return this.connection?.transport;
  }

  // public fields requiring attachment

  /** The provider origin URI, or `undefined` if this client is not attached. */
  public get origin(): string | undefined {
    return this.attached?.origin;
  }

  /** The attached provider, or `undefined` if this client is not attached. */
  public get provider(): PenumbraProvider | undefined {
    return this.attached?.provider;
  }

  /** The boolean provider connection status, or `undefined` if this client is
   * not attached to a provider. */
  public get connected(): boolean | undefined {
    return this.attached?.provider.isConnected();
  }

  /** The `PenumbraState` enumerated provider connection state, or `undefined` if
   * this client is not attached to a provider. */
  public get state(): PenumbraState | undefined {
    return this.attached?.provider.state();
  }

  /** The parsed `PenumbraManifest` associated with this provider, fetched at
   * time of provider attach. This will be `undefined` if this client is not
   * attached to a provider, or if the manifest fetch has not yet resolved.
   *
   * If you have awaited the return of `attach` or `connect`, this should be
   * present.
   */
  public get manifest(): PenumbraManifest | undefined {
    return this.attached?.manifest;
  }

  /** Assert client is attached. */
  private assertAttached() {
    if (!this.attached?.origin) {
      throw new PenumbraProviderNotAvailableError(this.attached?.origin);
    }
    assertProviderRecord(this.attached.origin);
    return this.attached;
  }

  /** Assert an active connection, and potentially init this client's transport. */
  private assertConnection() {
    assertProviderConnected(this.assertAttached().origin);
    this.connection ??= this.createConnection();
    return this.connection;
  }

  /** Create attachment to a specific provider. */
  private createAttached(providerOrigin: string): PenumbraClientAttachment {
    const attached: PenumbraClientAttachment = {
      manifest: undefined,
      origin: providerOrigin,
      provider: assertProviderRecord(providerOrigin),
      confirmManifest: getPenumbraManifest(providerOrigin),
    };
    void attached.confirmManifest.then(manifest => (attached.manifest = manifest));
    return attached;
  }

  /** Connect to the attached provider. */
  private createConnection() {
    const { confirmManifest, provider } = this.assertAttached();
    const request = confirmManifest.then(async () => {
      if (isLegacyProvider(provider)) {
        await provider.request();
      }
      return provider.connect();
    });
    const connection = {
      transport: createChannelTransport({
        ...this.options.transportOptions,
        getPort: () => request,
      }),
      port: request,
    };
    return connection;
  }

  /** Destroy any active connection and clients. */
  private destroyConnection() {
    void this.connection?.port.then(port => {
      port.postMessage(false);
      port.close();
    });
    this.connection = undefined;
    this.serviceClients.clear();
  }
}

export const createPenumbraClient = (
  requireProvider?: string,
  opt?: Partial<PenumbraClientOptions>,
) => new PenumbraClient(requireProvider, { ...PenumbraClient.defaultOptions, ...opt });
