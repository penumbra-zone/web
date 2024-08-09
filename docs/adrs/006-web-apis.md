# ADR 006: Client package API

Penumbra's web repository is growing fast. As more applications use its packages, introducing new changes will become increasingly difficult. This document aims to define what and how the packages should export and set the path for growth. However, the implementation of the APIs is not within the scope of this document.

Benefits for the ecosystem: A decreased entry level in Penumbra development leads to more created applications and faster mass adoption.

Benefits for Penumbra developers: API specifications aim to align the vision for package development and simplify the decision-making process when creating new features for external use.

## Design for dApp makers

**dApp makers** are developers of applications that connect to Penumbra account: transaction explorers, DEXes, payment systems, etc. They are interested in rapid development based on existing solutions and are often new not only to Penumbra but to blockchain as a whole. These developers need client-side libraries for wallet connection, data requests and data rendering.

When developing a web application for communicating with the Penumbra blockchain, dApp makers might need the following features:

- Identify available Penumbra connections
- Connect to Penumbra
- Disconnect from Penumbra
- Monitor the connection
- Fetch private information about the user
- Fetch public information about the chain
- Get real-time updates about the account and new blocks
- Create, authorize, and publish Penumbra transactions
- Create, authorize, and publish IBC transactions
- Verify transaction appearance on the chain
- Estimate transaction costs
- Trade and swap assets, provide liquidity
- Stake assets with validators
- Participate in governance

These features are available through API described and presented here.

## Client concepts

In public-state blockchains, web toolkits usually split the interface into at least two parts:

1. the wallet, keys, metadata (small, local, private)
2. the chain, viewing transactions (large, remote, public)

Examples include [Viem](https://viem.sh/docs/clients/intro) and [Thirdweb](https://portal.thirdweb.com/typescript/v5/client) on Ethereum.

This distinction works well when there is a clear separation between the client and the server.

But in Penumbra, the user is running a local node with a local copy of the chain. Instead of speaking to a remote server, a server is running directly in the user's web browser. This local 'light node' on the webpage is queryable with the same API as a remote 'full node', except the protocol is not `https`.

An additional pair of services (the `ViewService` and the `CustodyService`) are available on the local node, and represent the API to the private chain state.

## Client brief

It is reasonable to construct the notion of a **client** – the interface that manages connections and provides methods for interacting with the blockchain.

Creating the `PenumbraClient` should be the starting point for any application working with Penumbra. A simple example:

```ts
import { PenumbraClient } from '@penumbra-zone/client';
import { ViewService } from '@penumbra-zone/protobuf';

const providers: Record<string, PenumbraProvider> = PenumbraClient.getProviders();
const someProviderOrigin: keyof providers = /* choose a provider */

const penumbra = createPenumbraClient(someProviderOrigin);
await penumbra.connect(); // the user must approve a connection

const address0 = penumbra.service(ViewService).getAddressByIndex({ account: 0 })
```

The flow of work with the `PenumbraClient` would be as follows:

- Developer uses static methods of `PenumbraClient` to identify and choose a provider.
- Developer creates an instance of `PenumbraClient` to encapsulate configuration and connection state.
- The `PenumbraClient` instance establishes and manages the connection.

At this point, the developer may begin interacting with the public chain or the user's private state.

- The developer creates service-specific clients with the `service` method
- The service clients may query the service API endpoints to fetch information

These steps are evident above.

## `PenumbraProvider` interface

Any user may have one or multiple tools present that independently offer some kind of Penumbra service. These independent software are called "providers".

You can interact with providers directly, but it is recommended to use `PenumbraClient`.

Providers should identify themselves by origin URI, typically a chrome extension URI, and expose a simple `PenumbraProvider` API to initate connection.

Available providers may be discovered by a record on the document at `window[Symbol.for('penumbra')]`, of the type `Record<string, PenumbraProvider>` where the key is a URI origin at which the provider's manifest is hosted.

```ts
export interface PenumbraProvider {
  /** Should contain a URI at the provider's origin, serving a manifest
   * describing this provider. */
  readonly manifest: string;

  /** Call to acquire a `MessagePort` to this provider, subject to approval. */
  readonly connect: () => Promise<MessagePort>;

  /** Call to indicate the provider should discard approval of this dapp. */
  readonly disconnect: () => Promise<void>;

  /** `true` indicates active connection, `false` indicates inactive connection. */
  readonly isConnected: () => boolean;

  /** Synchronously return present state. */
  readonly state: () => PenumbraState;

  /**
   * Like a standard `EventTarget.addEventListener`, but providers should only
   * emit `PenumbraEvent`s (currently only `PenumbraStateEvent` with typename
   * `'penumbrastate'`.)  Event types and type guards are available from
   * `@penumbra-zone/client/event` or the root export.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   */
  readonly addEventListener: PenumbraEventTarget['addEventListener'];
  readonly removeEventListener: PenumbraEventTarget['addEventListener'];
}
```

## `PenumbraClient` interface

`PenumbraClient` is intended to be the 'entry' to the collection of service APIs for dapp developers inspecting or interacting with a user's Penumbra chain state.

PenumbraClient static methods will allow you to

- inspect available providers
- verify the provider is present
- choose a provider to connect

If you're developing a dapp using penumbra, you should likely:

- gate penumbra features, if no providers are installed
- display a button to initiate connection, if no providers are connected
- display a modal choice, if multiple providers are present

When you've selected a provider, you can provide its origin URI to `createPenumbraClient` or `new PenumbraClient`. This will create a client attached to that provider, and you can then:

- request permission to connect and create an active connection with `connect`
- access the provider's services with `service` and a `ServiceType` parameter
- release your permissions with `disconnect`

### Static features

Methods for inspecting providers without interaction are provided as static class members. None of these static methods will modify any provider state.

```ts
export declare class PenumbraClient {
  /** Return the record of all present providers available in the page. */
  static getProviders(): Record<string, PenumbraProvider>;

  /** Return a record of all present providers, and fetch their manifests. */
  static getAllProviderManifests(): Record<string, Promise<PenumbraManifest>>;

  /** Fetch manifest of a specific provider, or return `undefined` if the
   * provider is not present. */
  static getProviderManifest(providerOrigin: string): Promise<PenumbraManifest> | undefined;

  /** Return boolean connection state of a specific provider, or `undefined` if
   * the provider is not present. */
  static isProviderConnected(providerOrigin: string): boolean | undefined;

  /** Return connection state enum of a specific provider, or `undefined` if the
   * provider is not present. */
  static getProviderState(providerOrigin: string): PenumbraState | undefined;
}
```

### Instance features

After selecting a provider, you can use `createPenumbraClient` or the constructor to create an instance of `PenumbraClient` attached to your selected provider. The instance allows you to engage in more detail and begin state manipulation.

```ts
export declare class PenumbraClient {
  /** Construct a client instance but take no specific action. Will immediately
   * attach to a specified provider, or remain unconfigured. */
  constructor(providerOrigin?: string | undefined, options?: PenumbraClientOptions);

  /** Attempt to connect to the attached provider, or attach and then connect to
   * the provider specified by parameter.
   *
   * Presence of the public `connected` field can confirm the client is
   * connected or can connect.  The public `transport` field can confirm the
   * client possesses an active connection.
   *
   * May reject with an enumerated `PenumbraRequestFailure`.
   */
  connect(providerOrigin?: string): Promise<void>;

  /** Call `disconnect` on any associated provider to release connection
   * approval, and destroy any present connection. */
  disconnect(): Promise<void>;

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
  service<T extends ServiceType>(service: T): PromiseClient<T>;

  /** Simplified callback interface to the `EventTarget` interface of the
   * associated provider. */
  onConnectionStateChange(
    listener: (detail: PenumbraEventDetail<'penumbrastate'>) => void,
    removeListener?: AbortSignal,
  ): void;

  /** It is recommended to construct clients with a specific provider origin. If
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
  attach(providerOrigin: string): Promise<PenumbraManifest>;

  /** The parsed `PenumbraManifest` associated with this provider, fetched at
   * time of provider attach. This will be `undefined` if this client is not
   * attached to a provider, or if the manifest fetch has not yet resolved.
   *
   * If you have awaited the return of `attach` or `connect`, this should be
   * present.
   */
  get manifest(): PenumbraManifest | undefined;

  /** The provider origin URI, or `undefined` if this client is not attached. */
  get origin(): string | undefined;
  /** The attached provider, or `undefined` if this client is not attached. */
  get provider(): PenumbraProvider | undefined;
  /** The boolean provider connection status, or `undefined` if this client is
   * not attached to a provider. */
  get connected(): boolean | undefined;
  /** The `PenumbraState` enumerated provider connection state, or `undefined` if
   * this client is not attached to a provider. */
  get state(): PenumbraState | undefined;
}
```

### Service client features

The service-specific clients returned by the `service` method are generated from Protobuf specifications which are compiled into `ServiceType` definitions that may be imported from `@penumbra-zone/protobuf`. Your IDE should provide type introspection on the `ServiceType`, and on the returned `PromiseClient`.

It's recommended to read [ConnectRPC Web](https://connectrpc.com/docs/web/) documentation for general details of client use.

Penumbra's proto specs are published to the Buf Schema Registry at [buf.build/penumbra-zone/penumbra](https://buf.build/penumbra-zone/penumbra). You are likely interested in the [View service](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1) and the [Custody service](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.custody.v1) API docs.

More detailed and objective-specific documentation is available from [guide.penumbra.zone](https://guide.penumbra.zone/) and the [Penumbra web monorepo](https://github.com/penumbra-zone/web/). Web developers will be ineterested in the documentation of `@penumbra-zone/client` (discussed in this ADR) and `@penumbra-zone/react`.

The `@penumbra-zone/protobuf` package exports several services, but technically, the `PenumbraClient` interface is flexible enough that a provider could implement and provide any service they wish. Documentation on any uniquely available services should be sought from the developers of the provider.

The detailed Penumbra documentation is available at [protocol.penumbra.zone](https://protocol.penumbra.zone).
