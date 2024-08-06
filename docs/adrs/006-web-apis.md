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
import { createPenumbraClient } from '@penumbra-zone/client';

export const client = createPenumbraClient();
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
export interface PenumbraProvider extends Readonly<PenumbraStateEventTarget> {
  /** Should contain a URI at the provider's origin,
   * serving a manifest describing this provider */
  readonly manifest: string;

  /** Call to acquire a `MessagePort` to this provider, asks user for approval if wasn't connected before */
  readonly connect: () => Promise<MessagePort>;

  /** Call to indicate the provider should discard approval of this origin. */
  readonly disconnect: () => Promise<void>;

  /** Should synchronously return the present connection state.
   * - `true` indicates active connection.
   * - `false` indicates connection is inactive.
   */
  readonly isConnected: () => boolean;

  /** Synchronously return present injection state */
  readonly state: () => PenumbraState;

  /** Standard EventTarget methods emitting PenumbraStateEvent upon state changes */
  readonly addEventListener: PenumbraEventTarget['addEventListener'];
  /** Unsubscribes from the state change events. Provide the same callback as in `addEventListener` */
  readonly removeEventListener: PenumbraEventTarget['removeEvenListener'];
}
```

## Client API

A globally shared `client` instance should be able to establish the connection with
injected wallet providers and use the connection to query the blockchain. The API in this case would be:

```ts
import type { PenumbraService } from '@penumbra-zone/protobuf';
import type { PromiseClient } from '@connectrpc/connect';

interface PenumbraClient {
  /**
   * Connects to the injected provider, asks for user approval if wasn't connected before.
   * If `providerUrl` argument is not provided, tries to connect to the first injected provider.
   * Returns the manifest URL of the connected provider or throws an error otherwise.
   */
  readonly connect: (providerUrl?: string) => Promise<string>;

  /**
   * Tries to reconnect to the injected provider (the first one with `connected` state)
   * without asking for user approval
   */
  readonly reconnect: (providerUrl?: string) => Promise<string>;

  /** Reexports the `disconnect` function from injected provider */
  readonly disconnect: () => Promise<void>;
  /** Reexports the `isConnected` function from injected provider  */
  readonly isConnected: () => boolean | undefined;
  /** Reexports the `state` function from injected provider */
  readonly getState: () => PenumbraState;
  /** Provides a simplified callback interface to `PenumbraStateEvent`s. */
  readonly onConnectionChange: (
    cb: (connection: { origin: string; connected: boolean; state: PenumbraState }) => void,
  ) => void;

  /** Returns a new or re-used `PromiseClient<T>` for a specific `PenumbraService` */
  readonly service: <T extends PenumbraService>(
    service: T,
    options: Omit<ChannelTransportOptions, 'getPort'>,
  ) => PromiseClient<T>;
}
```

Moreover, the `client` package might export but not limited to the following useful functions and types:

```ts
export type PenumbraManifest = Partial<chrome.runtime.ManifestV3> &
  Required<Pick<chrome.runtime.ManifestV3, 'name' | 'version' | 'description' | 'icons'>>;

export type getInjectedProvider = (penumbraOrigin: string) => Promise<PenumbraProvider>;

export type getAllInjectedProviders = () => string[];

export type getPenumbraManifest = (
  penumbraOrigin: string,
  signal?: AbortSignal,
) => Promise<PenumbraManifest>;

export type getAllPenumbraManifests = () => Record<
  keyof (typeof window)[typeof PenumbraSymbol],
  Promise<PenumbraManifest>
>;
```

## Requests

The `PenumbraClient` should have a `service` method that returns a `PromiseClient` instance for a specific Penumbra service. Requesting data example:

```ts
import { createPenumbraClient } from '@penumbra-zone/client';
import { ViewService } from '@penumbra-zone/protobuf';

export const client = createPenumbraClient();
const viewService = client.service(ViewService);

const address = await viewService.getAddressByIndex({ account: 0 });
const balances = await viewService.getBalances({ account: 0 });
```

Under the hood, `client.service` might save the resulting PromiseClient in the `client` instance to avoid creating multiple instances of the same service.

Each call of the services function should check for a connection and throw an error if the connection is not established.
