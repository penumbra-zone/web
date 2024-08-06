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

In Penumbra, any blockchain query requires a connection with the wallet provider, therefore all actions and
queries can be called 'private'. It is reasonable to construct the notion of a **client** – the interface
that manages the injected connections and provides methods for interacting with the blockchain.

Creating the `client` should be the starting point for any application working with Penumbra:

```ts
import { PenumbraClient } from '@penumbra-zone/client';

const providers: Record<string, PenumbraProvider> = PenumbraClient.providers();
const someProviderOrigin: keyof providers = '....';

// connect will fetch and verify manifest before initiating connection, then return an active client
const someProviderClient = await PenumbraClient.connect(someProviderOrigin);
```

The flow of work with the `client` would be as follows:

- User creates an instance of the `client`
- They use the `client` to establish the injected connection, and the `client` saves the connection in its state
- To fetch information from the wallet, the application passes the `client` instance to the fetch methods

The idea of a single shared `client` is inspired by these popular TypeScript libraries:

- [Prisma ORM](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/instantiate-prisma-client)
- [Supabase](https://supabase.com/docs/reference/javascript/initializing)
- [Viem](https://viem.sh/docs/clients/intro)

## Injected connection

The `client` must be able to connect to injected wallets. To make the API possible, the interface injected into the `window` object must be standardized:

```ts
export interface PenumbraProvider extends Readonly<PenumbraEventTarget> {
  /** Should contain a URI at the provider's origin, serving a manifest
   * describing this provider */
  readonly manifest: string;

  /** Call to acquire a `MessagePort` to this provider, subject to approval. */
  readonly connect: () => Promise<MessagePort>;

  /** Call to indicate the provider should discard approval of this origin. */
  readonly disconnect: () => Promise<void>;

  /** Should synchronously return the present connection state.
   * - `true` indicates active connection.
   * - `false` indicates connection is inactive. */
  readonly isConnected: () => boolean;

  /** Synchronously return present injection state */
  readonly state: () => PenumbraState;

  /** Standard EventTarget methods emitting PenumbraStateEvent upon state changes */
  readonly addEventListener: PenumbraEventTarget['addEventListener'];
  readonly removeEventListener: PenumbraEventTarget['removeEvenListener'];
}
```

## Client API

A globally shared `client` instance should be able to establish the connection with
injected wallet providers and use the connection to query the blockchain. The API in this case would be:

```ts
import type { PenumbraService } from '@penumbra-zone/protobuf';
import type { PromiseClient } from '@connectrpc/connect';

interface PenumbraClientConstructor {
  // static features
  providers(): string[] | undefined;
  providerManifests(): Record<string, Promise<PenumbraManifest>>;

  // provider-specific static features
  providerManifest(providerOrigin: string): Promise<PenumbraManifest>;
  providerIsConnected(providerOrigin: string): boolean;
  providerState(providerOrigin: string): PenumbraState | undefined;

  // Initiates connection and returns a connected client instance.
  providerConnect<C extends string>(providerOrigin: C): Promise<PenumbraClient<C>>;

  // constructor for an instance bound to a specific provider
  new <O extends string>(providerOrigin: O): PenumbraClient<O>;
}

interface PenumbraClient<O extends string> {
  // constructor input
  origin: O;

  // populated when client is in appropriate state.
  transport?: Transport;
  port?: MessagePort;

  // direct re-exports from the selected provider
  disconnect(): Promise<void>;
  isConnected: () => boolean;
  state: () => PenumbraState;
  addEventListener: PenumbraProvider['addEventListener'];
  removeEventListener: PenumbraProvider['removeEvenListener'];

  /** Initiates connection request and then connection. A transport is
   * constructed, maintained internally and also returned to the caller. */
  connect: () => Promise<Transport>;

  /** Fetches manifest for the provider of this instance */
  manifest: () =>  Promise<PenumbraManifest>;

  // Returns a new or re-used `PromiseClient<T>` for a specific `PenumbraService`
  service = <T extends PenumbraService>(service: T): PromiseClient<T>;

  onConnectionStateChange(listener: (detail: PenumbraStateEventDetail) => void, removeListener?: AbortSignal): void;
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
