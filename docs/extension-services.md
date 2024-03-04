# Extension Services

Prax uses a custom transport for `@connectrpc/connect` to provide
Protobuf-specified services via a DOM channel `MessagePort` and the Chrome
extension runtime.

Interestingly, this transport should be generally applicable to any
Protobuf-specified interface, including all auto-generated clients and server
stubs from the buf registry.

If you are interested in using the transport for
your own project, the generic packages are available in
`@penumbra-zone/transport-dom` and `@penumbra-zone/transport-chrome`.

You may use locally generated service types, or simply install the [appropriate
packages from the buf
registry](https://buf.build/penumbra-zone/penumbra/sdks/main). If you are using
npm, buf's [npm-specific guide](https://buf.build/docs/bsr/generated-sdks/npm)
is recommended reading.

## Clients

Each channel transport can be used as a page-level singleton servicing multiple
clients. Developers using React queriers may be interested in
`@connectrpc/connect-query`.

Creation is fully synchronous from the constructor's perspective, and the client
is immediately useable, but requests are delayed until init actually completes.

### Connection to Prax

For developing a dapp that connects to Prax, you may use the convenience functions in `@penumbra-zone/client`.

```ts
import { createPraxClient } from '@penumbra-zone/client';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';

const viewClient = createPraxClient(ViewService);
```

### Connection to other Penumbra wallets

Other providers may be available.

```ts
import { getAnyPenumbraPort } from '@penumbra-zone/client';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';

const channelTransport = createChannelTransport({
  getPort: getAnyPenumbraPort,
  jsonOptions: { typeRegistry: createRegistry(ViewService) },
});

const viewClient = createPromiseClient(ViewService, channelTransport);
```

### The actual interface

These are just convenience methods to this interface. A global record, on which
arbitrary strings identify providers, with a simple interface to connect or
request permission to connect.

If you're developing a wallet, injection of a record here will allow you to
expose your wallet to potentially interested web apps.

<!-- keep in sync with @penumbra-zone/client/global.ts` -->

```ts
export const PenumbraSymbol = Symbol.for('penumbra');

export interface PenumbraProvider {
  readonly connect: () => Promise<MessagePort>;
  readonly request: () => Promise<boolean | undefined>;
  readonly isConnected: () => boolean | undefined;
  readonly manifest: string;
}

declare global {
  interface Window {
    readonly [PenumbraSymbol]?: undefined | Readonly<Record<string, PenumbraProvider>>;
  }
}
```

## Service Implementation

Services in this repository should eventually be re-useable, but you can also
implement your own services. Implementation is much like developing a web
service, using the normal ConnectRPC server-side metaphors and types.

This means your implementation should target the `ServiceImpl<ServiceType>` of a
`ServiceType` imported from a `connectrpc_es` package from the buf registry.

Full documentation is [available from
connectrpc](https://connectrpc.com/docs/node/implementing-services) but a brief
synopsis is provided here.

### Custody type example

An implementation of our CustodyService, which only has three endpoints,
would specify a type like:

- `ServiceImpl<typeof CustodyService>` for a complete implementation
- `Omit<ServiceImpl<typeof CustodyService>, 'exportFullViewingKey' | 'confirmAddress'>` for an implementation that omits two endpoints
- `Pick<ServiceImpl<typeof CustodyService>, 'authorize'>` for an implementation that only includes one endpoint

Targeting the full type, or a few selected methods, will provide type checking
of your implementation.

Providing your implementation to `ConnectRouter` creates a type-safe router into
your service. The `ConnectRouter` accepts a `Partial<ServiceImpl<ServiceType>>`,
but using this type for your implementation is not recommended, as it
provides no type safety.

You may alternatively type individual methods with `MethodImpl<MethodInfo>`
where `MethodInfo` is any member of `ServiceType.methods`.

The `HandlerContext` parameter on each method is not required to be implemented,
but unless your method is a pure function, you will need context. Context can be
injected by `adapter` from `@penumbra-zone/transport-dom`.

See connectrpc's [helper types
documentation](https://connectrpc.com/docs/node/implementing-services#helper-types)
for more information.

<!--
TODO: link to implementation in the codebase
-->

## Message flow

Message flow between the extension and the webapp looks like this:

<!--
TODO: review for necessary updates?
-->

```mermaid
sequenceDiagram
box Page
    participant PromiseClient
    participant Transport as ChannelTransport
end

box Injected
    participant ContentScript as ConnectionManager
end

box Extension Background
    participant Background as ConnectionManager
    participant Service as ConnectRouter
end

Note left of PromiseClient: Init
  Transport -->>+ ContentScript: getPort MessagePort
  PromiseClient -> Transport: construct
  ContentScript ->>+ Background: chrome.runtime.connect Port

Note right of Background: OriginRegistry
  Background -> Service: router entry

rect rgba(0.5, 0.5, 0.5, 0.1)
  Note left of PromiseClient: unary
    PromiseClient -) Transport: unary rpc
    Transport ->> ContentScript: MessagePort TransportMessage call
    ContentScript -->> Background: chrome.runtime.Port TransportMessage call
    Background -)+ Service: request routed, awaited
    Service --) Service: Proxy or Local
    Service ->- Background: response resolved
    Background -->> ContentScript: chrome.runtimePort TransportMessage response
    ContentScript ->> Transport: MessagePort TransportMessage response
    Transport -> PromiseClient: unary resolved
end

rect rgba(0.5, 0.5, 0.5, 0.1)
  Note left of PromiseClient: serverstream
    PromiseClient -) Transport: serverstream rpc
    Transport ->> ContentScript: MessagePort TransportMessage call
    ContentScript -->> Background: chrome.runtime.Port TransportMessage call
    Background -)+ Service: request routed, awaited
    Service --) Service: Proxy or Local
    Service ->+ Background: response streamed
    Background ->>+ ContentScript: TransportChannelInit sub channel
    Background -->> ContentScript: chunk
    ContentScript ->> Transport: MessagePort TransportStream ReadableStream
    Background -->> ContentScript: chunk
    Transport ->+ PromiseClient: serverstream begin
    Background -->> ContentScript: chunk
    Service ->- Background: response stream resolved
    Background -->> ContentScript: chunk
    Background -x- ContentScript: sub channel end
    ContentScript ->- Transport: ReadableStream end
    PromiseClient ->- Transport: serverstream resolved
end

Note left of PromiseClient: Client end
destroy PromiseClient
PromiseClient --x PromiseClient: garbage collect
destroy Transport
Transport --x Transport: garbage collect
destroy ContentScript
ContentScript --x- ContentScript: garbage collect

Background -x- ContentScript: chrome.runtime.Port disconnect
```
