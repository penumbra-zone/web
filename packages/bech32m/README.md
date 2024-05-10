# `@penumbra-zone/bech32m`

This package is for validating and manipulating bech32m strings relevant to the
Penumbra blockchain.

- validate bech32m strings, including checksums
- enforce expected lengths of input and output
- convert back and forth between string and binary representations

## Simple use

It is recommended to use the typed functions provided in the submodules, each
named after the relevant prefix.

```ts
import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';

// typical use
const fvk: { inner: Uint8Array } = fullViewingKeyFromBech32m(
  'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09i',
);

// will throw
const badFvk: { inner: Uint8Array } = fullViewingKeyFromBech32m('penumbrafullviewingkey1badinput');

// will succeed, but this all-zero key identifies nothing
const validator: string = bech32mIdentityKey({ ik: new Uint8Array(32) });
```

## Typical use

If you're working with Penumbra bech32m strings, there's a good chance you also
want to use our protobuf message types. The buf registry package
`@buf/penumbra-zone_penumbra.bufbuild_es` is a peer dependency.

Exported functions do not explicitly refer to those types, in order to permit
production use without bundling the definitions, but all input/output will
satisfy the relevant structures.

```ts
import { assetIdFromBech32m } from '@penumbra-zone/bech32m/passet';
import { plpidFromBech32m } from '@penumbra-zone/bech32m/plpid';
import { spendKeyFromBech32m } from '@penumbra-zone/bech32m/penumbraspendkey';

import type { PlainMessage, PartialMessage } from '@bufbuild/protobuf';
import type { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import type { PositionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { SpendKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

const plainAssetId: PlainMessage<AssetId> = assetIdFromBech32m(
  'passet1vhga2czmpk76hsu3t7usjj2a2qga0u29vqlcp3hky8lwkfz30qrqy6gaae',
);

const partialPositionId: PartialMessage<PositionId> = plpidFromBech32(
  'plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689',
);

// you must explicitly construct the object if you want to use functions
// available on the @bufbuild/protobuf Message class

const realSpendKey: SpendKey = new SpendKey(
  spendKeyFromBech32m(
    'penumbraspendkey1qul0huewkcmemljd5m3vz3awqt7442tjg2dudahvzu6eyj9qf0eszrnguh',
  ),
);

// marshal to protojson
realSpendKey.toJson();
// { "inner": "Bz778y62N53+TabiwUeuAv1aqXJCm8b27Bc1kkigS/M=" }

// true
realSpendKey.equals({
  inner: new Uint8Array([
    0x07, 0x3e, 0xfb, 0xf3, 0x2e, 0xb6, 0x37, 0x9d, 0xfe, 0x4d, 0xa6, 0xe2, 0xc1, 0x47, 0xae, 0x02,
    0xfd, 0x5a, 0xa9, 0x72, 0x42, 0x9b, 0xc6, 0xf6, 0xec, 0x17, 0x35, 0x92, 0x48, 0xa0, 0x4b, 0xf3,
  ]),
});
```

## Constants only

If you already have a validation solution and just need the parameters, you can
import simple constants from the main module. This technique should bundle very
small.

```js
import {
  PENUMBRA_BECH32M_ADDRESS_LENGTH as pnLength,
  PENUMBRA_BECH32M_ADDRESS_PREFIX as pnPrefix,
} from '@penumbra-zone/bech32m';

// matches prefix, length, and valid charset. no checksum validation.
export const addressRegex = new RegEx(
  `^${pnPrefix}1[02-9ac-hj-np-z]{${pnLength - (pnPrefix.length + 1)}}$`,
);
```

## penumbracompat1 is bech32, not bech32m

For IBC compatibility, we provide a `penumbracompat1` address format that is
bech32 instead of bech32m. You can use `penumbracompat1` when interacting with
any chain that does not support a bech32m destination.

```ts
import { bech32Address } from '@penumbra-zone/bech32m/penumbra';
import { bech32CompatAddress } from '@penumbra-zone/bech32m/penumbracompat1';

const bech32Chains = ['noble', 'nobletestnet'];
const getCompatibleAddress = (chainName: string, address: { inner: Uint8Array }): string => {
  return bech32Chains.includes(chainName) ? bech32CompatAddress(address) : bech32mAddress(address);
};
```
