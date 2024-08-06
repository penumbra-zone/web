# ADR 006: Client package API

Penumbra's web repository is growing fast. As more applications use its packages, introducing new changes will become increasingly difficult. This document aims to define what and how the packages should export and set the path for growth. However, the implementation of the APIs is not within the scope of this document.

Benefits for the ecosystem: A decreased entry level in Penumbra development leads to more created applications and faster mass adoption.

Benefits for Penumbra developers: API specifications aim to align the vision for package development and simplify the decision-making process when creating new features for external use.

## Design for dApp makers

**dApp makers** are developers of applications that connect to Penumbra account: transaction explorers, DEXes, payment systems, etc. They are interested in rapid development based on existing solutions and are often new not only to Penumbra but to blockchain as a whole. These developers need client-side libraries for wallet connection, data requests and data rendering.

When developing a web application for communicating with the Penumbra blockchain, dApp makers might need the following features:

- Get a list of injected wallets
- Connect to account
- Disconnect from account
- Monitor the connection
- Get and display private information about the account
- Get and display public information about the blockchain
- Get real-time updates about the account and new blocks
- Sign and send transactions within Penumbra
- Wait for transactions to be complete
- Send IBC transactions
- Estimate transaction costs
- Stake and swap assets
- Participate in protocol governance

This list is supposed to be covered by the proposed API, documented and presented with examples to users.

## Creating the client

In other blockchains, JavaScript SDKs usually split the interfaces into at least two parts: one that manages the wallet connection and private transactions, and one that reads the public blockchain data. Examples include [Viem](https://viem.sh/docs/clients/intro) and [Thirdweb](https://portal.thirdweb.com/typescript/v5/client) on Ethereum.

In Penumbra, any blockchain query requires a connection with the wallet provider, therefore all actions and queries can be called 'private'. It is reasonable to construct the notion of a **client** – the interface that manages the injected connections and provides methods for interacting with the blockchain.

Creating the `PenumbraClient` should be the starting point for any application working with Penumbra:

```ts
import { PenumbraClient } from '@penumbra-zone/client';

const providers: Record<string, PenumbraProvider> = PenumbraClient.providers();
const someProviderOrigin: keyof providers = '....'; // dapp chooses a provider

// connect will fetch and verify manifest before initiating connection, then return an active client
const someProviderClient = await PenumbraClient.providerConnect(someProviderOrigin);
```

The flow of work with the `PenumbraClient` would be as follows:

- Developer uses static methods of `PenumbraClient` to choose a provider.
- Developer creates an instance of `PenumbraClient`
- The `PenumbraClient` instance establishes and manages the connection
- To interact with the chain or the user's local state, the developer creates service-specific clients with their client's `service` method
- The service clients may query the service API endpoints to fetch information

## Provider interface

Available providers may be discovered by a record on the document at `window[Symbol.for('penumbra')]`, of the type `Record<string, PenumbraProvider>` where the key is a URI origin at which the provider's manifest is hosted.

This record may be inspected directly, but it is recommended to use the `PenumbraClient` features described later.

```ts
export interface PenumbraProvider extends Readonly<PenumbraEventTarget> {
  /** Should contain a URI at the provider's origin, serving a manifest
   * describing this provider. */
  readonly manifest: string;

  /** Call to acquire a `MessagePort` to this provider, subject to approval. */
  readonly connect: () => Promise<MessagePort>;

  /** Call to indicate the provider should discard approval of this origin. */
  readonly disconnect: () => Promise<void>;

  /** Should synchronously return the present connection state.
   * - `true` indicates active connection.
   * - `false` indicates inactive connection.
   */
  readonly isConnected: () => boolean;

  /** Synchronously return present injection state. */
  readonly state: () => PenumbraState;

  /** Like a standard `EventTarget.addEventListener`, but providers should only
   * emit `PenumbraEvent`s (currently only `PenumbraStateEvent` with typename
   * `'penumbrastate'`.)  Event types and type guards are available from
   * `@penumbra-zone/client/event` or the root export.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   */
  readonly addEventListener: PenumbraEventTarget['addEventListener'];
  readonly removeEventListener: PenumbraEventTarget['addEventListener'];
}
```

## Client API

A `PenumbraClient` class is exported with static methods to allow provider inspection, and an instance to represent active connection to a provider.

```ts
import type { PenumbraService } from '@penumbra-zone/protobuf';
import type { PromiseClient } from '@connectrpc/connect';

export declare class PenumbraClient<O extends string> {
  // static features

  /** Return a list of all present provider origins available in the page, or
   * `undefined` if no object is present at `window[Symbol.for('penumbra')]`
   * (indicating no providers installed). */
  static providers(): string[] | undefined;

  /** Return a record of all present providers with pending fetches of their
   * manifests. */
  static providerManifests(): Record<string, Promise<PenumbraManifest>>;

  /* Fetch manifest of a specific provider. */
  static providerManifest(providerOrigin: string): Promise<PenumbraManifest>;

  /* Return boolean connection state of a specific provider. */
  static providerIsConnected(providerOrigin: string): boolean;

  /* Return connection state enum of a specific provider. */
  static providerState(providerOrigin: string): PenumbraState | undefined;

  /* Make a connection attempt to a specific provider, and return a client bound
   * to that provider if successful. May reject with an enumerated
   * `PenumbraRequestFailure`. */
  static providerConnect<N extends string>(providerOrigin: N): Promise<PenumbraClient<N>>;

  // instance features
  /** The provider origin provided during client construction. */
  readonly origin: O;

  /** Create an instance representing connection to a specific provider,
   * identified by the origin parameter, and take no specific action. It is
   * recommended to use the static `PenumbraClient.providerConnect`, but the
   * constructor is directly available to developers interested in greater
   * control. */
  constructor(origin: O, transportOptions?: Omit<ChannelTransportOptions, 'getPort'> | undefined);

  /** The `MessagePort` used by this connection. */
  get port(): MessagePort | undefined;
  /** The ConnectRPC `Transport` created by this connection. */
  get transport(): Transport | undefined;

  /** Return the `PenumbraManifest` associated with this provider, fetched at
   * time of client creation. Fetch is an async operation so this may be
   * undefined until it completes. If you hold an active connection to this
   * provider, this should be present. */
  manifestSync(): PenumbraManifest | undefined;

  /** Return a promised `PenumbraManifest` associated with this provider. If you
   * hold an active connection to this provider, this promise should be
   * successfully resolved. */
  manifest(): Promise<PenumbraManifest>;

  /** Return the `Transport` representing the present connection, or create it if
   * necessary by calling `connect` to obtain a `MessagePort` from the
   * associated provider. */
  connect(): Promise<Transport>;

  /** Call `disconnect` on the associated provider to release connection approval. */
  disconnect(): Promise<void>;

  /** Return a `PromiseClient<T>` for some `T extends ServiceType`, using
   * transport created internally. You should call this method *after*
   * connection is resolved, or it will fail. You can check for the presence of
   * a `transport` on this instance. */
  service<T extends PenumbraService>(service: T): PromiseClient<T>;

  /** Promise a `PromiseClient<T>` for some `T extends ServiceType`, using
   * transport created internally, pending a successful connection. */
  connectService<T extends ServiceType>(service: T): Promise<PromiseClient<T>>;

  /* direct re-exports from the associated provider */
  get isConnected(): () => boolean;
  get state(): () => PenumbraState;
  get addEventListener(): PenumbraProvider['addEventListener'];
  get removeEventListener(): PenumbraProvider['removeEventListener'];

  /** Simplified callback interface to the `EventTarget` interface of the
   * associated provider. */
  onConnectionStateChange(
    listener: (detail: PenumbraStateEventDetail) => void,
    removeListener?: AbortSignal,
  ): void;
}
```

Requesting data example:

```ts
import { PenumbraClient } from '@penumbra-zone/client';
import { ViewService } from '@penumbra-zone/protobuf';

const providers: Record<string, PenumbraProvider> = PenumbraClient.providers();
const someProviderOrigin: keyof providers = '....';

const penumbraClient = await PenumbraClient.connect(someProviderOrigin);

const viewClient = penumbraClient.service(ViewService);

const address = await viewClient.getAddressByIndex({ account: 0 });
const balances = await viewClient.getBalances({ account: 0 });
```
