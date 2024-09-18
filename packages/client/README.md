# `@penumbra-zone/client`

This package allows developers to create dApps that connect to Penumbra providers and query the Penumbra blockchain.

You can check this package in action in the [NextJS example repo](https://github.com/penumbra-zone/nextjs-penumbra-client-example) or read the [Architecture Decision Record (ADR-006)](https://github.com/penumbra-zone/web/blob/main/docs/adrs/006-web-apis.md) describing the idea behind this package.

## A simple example

```ts
import { PenumbraClient } from '@penumbra-zone/client';
import { ViewService } from '@penumbra-zone/protobuf';

const penumbra = createPenumbraClient();

// Get the `Record<string, PenumbraProvider>` – an object with keys as
// provider origin URIs and values as PenumbraProvider instances.
const providers = PenumbraClient.getProviders();

// Choose a provider to connect to
const someProviderOrigin: keyof providers = Object.keys(providers)[0];

// Get the provider's manifest – info about this provider with name, description, icons, etc.
const manifest = await penumbra.getProviderManifest(someProviderOrigin);
console.log(manifest.name); // e.g. "Prax wallet"

// Connect to the provider – user must approve the origin
await penumbra.connect(someProviderOrigin);

// Get a view service – a private query service to access the user's data from the provider
const address0 = penumbra.service(ViewService).getAddressByIndex({ account: 0 });
```
