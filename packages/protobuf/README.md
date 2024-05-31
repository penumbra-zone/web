# `@penumbra-zone/protobuf`

## If you are looking for a Penumbra extension client

You should install `@penumbra-zone/client`. This package is provided for
developers interested in lower-level work or more detailed configuration.

---

This package collects types and some configuration intended for use with
`@penumbra-zone/transport-dom`.

**To use this package, you need to [enable the Buf Schema Registry](https://buf.build/docs/bsr/generated-sdks/npm):**

```sh
echo "@buf:registry=https://buf.build/gen/npm/v1/" >> .npmrc
```

### Exports

This package exports a `typeRegistry` (and `jsonOptions` including said
registry) for use with `createChannelTransport` or any `@connectrpc` transport.

All types necessary for a to serialize/deserialize communication with Prax or
any other Penumbra extension are included.

Service definitions for all relevant services are also re-exported.

### A Simple example

```js
import { jsonOptions } from '@penumbra-zone/protobuf';
import { createChannelTransport } from '@penumbra-zone/transport-dom';

// naively get first available provider
const provider = Object.values(window[Symbol.for('penumbra')])[0];
void provider.request();

// establish a transport
const transport = createChannelTransport({ jsonOptions, getPort: provider.connect });

// export function to create client
export const createPenumbraClient = serviceType => createPromiseClient(serviceType, transport);
```
