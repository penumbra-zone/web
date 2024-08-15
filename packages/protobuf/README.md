# `@penumbra-zone/protobuf`

This package exports protobuf message types generated with `@bufbuild` intended
for use with other `@penumbra-zone` packages.

## If you are looking for a Penumbra client

You should install `@penumbra-zone/client`.

### Other Exports

This package exports a `typeRegistry` (and `jsonOptions` including said
registry) for use with `createChannelTransport` of
`@penumbra-zone/transport-dom` or any `@connectrpc` transport.

All types necessary for a to serialize/deserialize communication with Prax or
any other Penumbra provider are included.

Service definitions for all relevant Penumbra services, and some related Cosmos
definitions are exported.

### A Simple example

```js
import { jsonOptions } from '@penumbra-zone/protobuf';
import { createChannelTransport } from '@penumbra-zone/transport-dom';

// naively get first available provider
const provider = Object.values(window[Symbol.for('penumbra')])[0];

// establish a transport
const transport = createChannelTransport({ jsonOptions, getPort: provider.connect });

// export function to create client
export const createPenumbraClient = serviceType => createPromiseClient(serviceType, transport);
```
