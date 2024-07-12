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
/** The callback type for the `penumbrastate` event */
export type PenumbraStateEventHandler = (
  value: CustomEvent<{ origin: string; connected: boolean; state: PenumbraState }>,
) => void;

/**
 * Describes the type of `addListener` and `removeListener` functions.
 * If there will more event types in the future, this function should be overloaded
 */
export type PenumbraListener = (type: 'penumbrastate', value: PenumbraStateListener) => void;

export interface PenumbraProvider extends Readonly<PenumbraStateEventTarget> {
  /** Should contain a URI at the provider's origin,
   * serving a manifest describing this provider */
  readonly manifest: string;

  /** Call to gain approval. Returns `MessagePort` to this provider.
   * Might throw descriptive errors if user denies the connection */
  readonly connect: () => Promise<MessagePort>;

  /** Call to indicate the provider should discard approval of this origin.
   * Successfull if doesn't throw errors */
  readonly disconnect: () => Promise<void>;

  /** Should synchronously return the present connection state.
   * - `true` indicates active connection.
   * - `false` indicates connection is closed, rejected, or not attempted.
   */
  readonly isConnected: () => boolean;

  /** Synchronously return present injection state */
  readonly state: () => PenumbraState;

  /** Fires a callback with CustomEvent each time the state changes */
  readonly addEventListener: PenumbraListener;
  /** Unsubscribes from the state change events. Provide the same callback as in `addListener` */
  readonly removeEventListener: PenumbraListener;
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
   * Asks users to approve the connection to a specific browser manifest URL.
   * If `manifest` argument is not provided, tries to connect to the first injected provider.
   * Returns the manifest URL of the connected provider or error otherwise
   */
  readonly connect: (providerUrl?: string) => Promise<string>;

  /** Reexports the `disconnect` function from injected provider */
  readonly disconnect: () => Promise<void>;
  /** Reexports the `isConnected` function from injected provider  */
  readonly isConnected: () => boolean | undefined;
  /** Reexports the `state` function from injected provider */
  readonly getState: () => PenumbraState;
  /** Reexports the `onConnectionChange` listener from injected provider*/
  readonly onConnectionChange: (
    cb: (connection: { origin: string; connected: boolean; state: PenumbraState }) => void,
  ) => void;

  /**
   * Needed for custom service connections if `getService` is not enough.
   * For example, might be useful for React wrapper of the `client` package
   */
  readonly getMessagePort: () => MessagePort;
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

The client library should separately export the creation of service clients. It is not going to be integrated into the `client` instance to save the initial bundle size. Instead, it should be exported from `@penumbra-zone/client/service`:

```ts
/** Synchronously creates a connectrpc `PromiseClient` instance to a given Penumbra service */
export type createServiceClient = <T extends ServiceType>(
  client: PenumbraClient,
  service: T,
) => PromiseClient<T>;
```

Under the hood, `createServiceClient` might save the resulting PromiseClient in the `client` instance to avoid creating multiple instances of the same service.

Requesting data example:

```ts
import { createPenumbraClient } from '@penumbra-zone/client';
import { createServiceClient } from '@penumbra-zone/client/servce';
import { ViewService } from '@penumbra-zone/protobuf';

export const client = createPenumbraClient();

const viewService = createServiceClient(client, ViewService);

const address = await viewService.getAddressByIndex({ account: 0 });
const balances = await viewService.getBalances({ account: 0 });
```

Each call of the services function should check for a connection and throw an error if the connection is not established.
