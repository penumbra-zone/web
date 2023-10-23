# Third-party wallet integration

This guide is meant to assist external wallets in integrating Penumbra.

![third-party](https://github.com/penumbra-zone/web/assets/16624263/62c6ca67-3561-45e6-a68a-c6e92cc807db)
[_Excalidraw link_](https://excalidraw.com/#json=cVjzyH00C16dF5ZojQQwr,1JZYosp0ZIenGfSfVVgGeA)

This mono-repo exposes a number of different packages:

- @buf/penumbra-zone_penumbra.bufbuild_es
- @buf/penumbra-zone_penumbra.connectrpc_es
- @penumbra-zone/constants
- @penumbra-zone/crypto-web
- @penumbra-zone/query
- @penumbra-zone/router
- @penumbra-zone/services
- @penumbra-zone/storage
- @penumbra-zone/transport
- @penumbra-zone/types
- @penumbra-zone/ui
- @penumbra-zone/wasm-ts

Each of them handle a different part of the system. Depending on the third-party's stack,
these can be used in a high-level or low-level way.

### Full-service implementation

Zooming out, these packages allow the third party to expose a Penumbra grpc service
(abiding by [Penumbra's protobuf definitions](https://buf.build/penumbra-zone/penumbra))
that runs over the `chrome.runtime` and `window` event messaging system. Here is what that looks like.

Setup `services` and `router` in your extension's **service worker**:

```typescript
// service-worker.ts
import { Services } from '@penumbra-zone/services';
import { penumbraMessageHandler } from '@penumbra-zone/router';

export const services = new Services();
await services.initialize();
chrome.runtime.onMessage.addListener(penumbraMessageHandler(services));
```

It will initialize block syncing and handle grpc routing automatically.

Next, ensure your extension `content scripts` are forwarding window messages to the extension:

```typescript
// content-scripts.ts
import { proxyMessages } from '@penumbra-zone/transport/src/proxy';

proxyMessages();
```

From within the extension/popup, you can now issue grpc requests:

```typescript
// in popup.ts
import { createPromiseClient } from '@connectrpc/connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { createExtInternalEventTransport } from '@penumbra-zone/transport/src/proxy';

export const grpcClient = createPromiseClient(
  ViewProtocolService,
  createExtInternalEventTransport(ViewProtocolService),
);

const response = await grpcClient.appParameters({});
```

From within a dapp, you can issue grpc requests:

```typescript
import { createPromiseClient } from '@connectrpc/connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { createEventTransport, useStream } from '@penumbra-zone/transport';

export const viewClient = createPromiseClient(
  ViewProtocolService,
  createEventTransport(ViewProtocolService),
);

// In React component
const syncStream = useMemo(() => viewClient.statusStream({}), []);
const { data, error } = useStream(syncStream);
```

Any rpc in the [protobuf definitions](https://buf.build/penumbra-zone/penumbra) _should_ have support. If there is not something
there that you need, reach out to the team!

### Lower-level implementation

It may likely be a case that this solution doesn't work 1:1 with your system. Example reasons:

- The route handling is completely different in the extension
- Desire to manage things like block syncing at a fine-grained level
- Need to specifically integrate with a custom custody setup
- Only specific parts of a package are needed

No worries, these packages can be used independently. Some examples:

```typescript
// Want to get the penumbra address at a specific index?
import { getAddressByIndex } from '@penumbra-zone/wasm-ts';
const address = getAddressByIndex(fullViewingKey, 721);
```

```typescript
// Want to query blocks?
import { CompactBlockQuerier } from '@penumbra-zone/query';
const querier = new CompactBLockQuerier({ grpcEndpoint: 'https://grpc.testnet.penumbra.zone' });
for await (const block of querier.compactBlock.compactBlockRange({
  startHeight,
  keepAlive: false,
})) {
  // do something with blocks...
}
```

```typescript
// Want to query blocks?
import { CompactBlockQuerier } from '@penumbra-zone/query';
const querier = new CompactBLockQuerier({ grpcEndpoint: 'https://grpc.testnet.penumbra.zone' });
for await (const block of querier.compactBlock.compactBlockRange({
  startHeight,
  keepAlive: false,
})) {
  // do something with blocks...
}
```

```typescript
// Want to manage indexeddb storage?
import { IndexedDb } from '@penumbra-zone/storage';

const indexedDb = await IndexedDb.initialize({
  chainId: 'penumbra-testnet-titan',
  dbVersion: 15,
  walletId: 'penumbrawalletid13590af90j2f9j0...',
});

// Later on...
const allNotes = await indexedDb.getAllNotes();
```

### Have feedback?

Let us know! We are quite interested in making these libraries even more useful to third-parties.
