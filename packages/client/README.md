# `@penumbra-zone/client`

This package contains interfaces, types, and some helpers for using the page API to Penumbra providers.

**To use this package, you need to [enable the Buf Schema Registry](https://buf.build/docs/bsr/generated-sdks/npm):**

```sh
echo "@buf:registry=https://buf.build/gen/npm/v1/" >> .npmrc
```

## A simple example

```ts
import { bech32mAddress } from '@penumbra-zone/bech32m';
import { createPenumbraClient } from '@penumbra-zone/client/create';
import { ViewService, SctService } from '@penumbra-zone/protobuf';

// This may connect to any available injected provider.
const viewClient = createPenumbraClient(ViewService);

// Or, you might prefer a specific provider.
const praxViewClient = createPenumbraClient(
  ViewService,
  'chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe',
);

const { address } = await praxViewClient.addressByIndex({});
console.log(bech32mAddress(address));
```

## React use

It's likely you want to use this client in your webapp, and there's a good
chance you're using React. Penumbra providers use `@connectrpc` tooling, so
these clients are supported by `@connectrpc/query` and `@tanstack/react-query`.

After using `createPenumbraChannelTransport` from `@penumbra-zone/client/create`
and `TransportProvider` from `@connectrpc/query` in a parent component, you can
use convenient React idioms.

You can see a full example of this at https://github.com/penumbra-zone/nextjs-penumbra-client-example

### A parent component

```ts
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { syncCreatePenumbraChannelTransport } from "@penumbra-zone/client/create";
import { TransportProvider } from "@connectrpc/connect-query";
import { useMemo } from "react";

const queryClient = new QueryClient();

export const PenumbraQueryProvider = ({
  providerOrigin,
  children,
}: {
  providerOrigin: string;
  children: React.ReactNode;
}) => {
  const penumbraTransport = useMemo(
    () => syncCreatePenumbraChannelTransport(providerOrigin),
    [providerOrigin],
  );
  return (
    <TransportProvider transport={penumbraTransport}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TransportProvider>
  );
};
```

### A querying component

```ts
"use client";
import { addressByIndex } from "@buf/penumbra-zone_penumbra.connectrpc_query-es/penumbra/view/v1/view-ViewService_connectquery";
import { bech32mAddress } from "@penumbra-zone/bech32m/penumbra";
import { useQuery } from "@connectrpc/connect-query";

export const PenumbraAddress = ({ account }: { account?: number }) => {
  const { data } = useQuery(addressByIndex, { addressIndex: { account } });
  return (
    data?.address && (
      <span className="address">{bech32mAddress(data.address)}</span>
    )
  );
};
```

## You could access the providers directly, without importing this package.

This example is javascript.

```js
import { createChannelTransport } from '@penumbra-zone/transport-dom';
import { createPromiseClient } from '@connectrpc/connect';
import { jsonOptions, ViewService } from '@penumbra-zone/protobuf';

// naively get first available provider
const provider = Object.values(window[Symbol.for('penumbra')])[0];
void provider.request();

// create a client
const viewClient = createPromiseClient(
  ViewService,
  createChannelTransport({ jsonOptions, getPort: provider.connect }),
);

const { catchingUp, fullSyncHeight } = viewClient.status({});
```
