# `@penumbra-zone/protobuf`

**To use this package, you need to [enable the Buf Schema Registry](https://buf.build/docs/bsr/generated-sdks/npm)**

```sh
echo "@buf:registry=https://buf.build/gen/npm/v1/" >> .npmrc
```

This package exports a `typeRegistry` (and inclusive `jsonOptions`) for use with
`@bufbuild` and `@connectrpc` tooling, particularly
`@penumbra-zone/transport-dom`.

All message types necessary for a Connect `Transport` to serialize/deserialize
communication with Prax or any other Penumbra extension are included.

## If you simply need a Penumbra extension client

You're looking for `@penumbra-zone/client`, which handles this process for you
and also performs some basic safety checks.

This package is provided for those who are interested in lower-level work or
more detailed configuration.

### Simple example

```ts
import { jsonOptions } from '@penumbra-zone/protobuf';

import { createChannelTransport } from '@penumbra-zone/transport-dom';
import type { ServiceType } from '@bufbuild/protobuf';

// unsafely get first available provider
const getPort = () => Object.values(window[Symbol.for('penumbra')])[0].connect();

// establish transport
const transport = createChannelTransport({ jsonOptions, getPort });

// function to create client
export const createPenumbraClient = (serviceType: ServiceType) =>
  createPromiseClient(serviceType, transport);
```
