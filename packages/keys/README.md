# `@penumbra-zone/keys`

This package contains cryptographic keys relevant to the Penumbra blockchain,
and checksums to validate the integrity of those keys.

The default export is a JSON mapping of Penumbra `Action` names to their
relevant key, necessary for building cryptographic proofs for those actions.
Keys are exported as `[key_name]_pk.bin`.

A basic shell script `penumbra-download-keys` is provided, if you have specific
versioning, bundling, or copying needs. Most users can use the keys exported
from the package.

## Using Keys

If your bundler supports `import.meta.resolve`, you can handle the raw key material like this:

```ts
const res: Result = await fetch(import.meta.resolve('@penumbra-zone/keys/convert_pk.bin'));
const keyBuf: ArrayBuffer = await res.arrayBuffer();
const convertPk = new Uint8Array(keyBuf);
```

## A More Complex Example

If your bundler doesn't support `import.meta.resolve`, or you rely on customized
bundling, you might want to just handle URLs. Our `@penumbra-zone/wasm` package
expects you to input key URL strings when building `Action`s.

Here's a simplified example of how we use the packages together in our reference
wallet extension:

```ts
import actionKeys from '@penumbra-zone/keys';

import type { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import type {
  Action,
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

// map filenames to bundled key asset URLs
const keyUrls = actionKeys.map(keyFileName => new URL(`keys/${keyFileName}`, PRAX_ORIGIN));

async function buildAction(
  txPlan: TransactionPlan,
  witness: WitnessData,
  fvk: FullViewingKey,
  actionIndex: number,
): Promise<Action> {
  // Dynamically load wasm module
  const builder = await import('@penumbra-zone/wasm/build');

  // Identify action type
  const actionType: Action['value']['case'] = transactionPlan.actions[actionPlanIndex]!.action.case;

  // Identify key url, if present
  const keyUrl: string | undefined = keyUrls[actionType]?.href;

  // Build action
  return builder.buildActionParallel(txPlan, witness, fvk, actionIndex, keyUrl);
}
```

### Using the management script

An executable `penumbra-download-keys` is included. It can checksum the keys
included in this package, and download other versions referenced by git tag if
you are working with a testnet or other custom chain with its own proving keys.

In any workspace where this package is installed, you can use

```sh
[npm|pnpm|yarn] exec penumbra-download-keys [output-path] [git tag] [sha256 manifest]
```

Which will acquire the default keys and display checksum validation, if a key
manifest is already present. You can further specify a version and custom
manifest file.

#### Updating the keys

If new keys are released by core, change the `defaultKeysVersion` variable in the `download-keys` script to the new version of the keys. Then:

1. Run the `download-keys` script (per the instructions above)
2. `cd keys`
3. `shasum -a 256 *.bin > ../shasums/vX.X.X.shasum` (change `vX.X.X` to the actual version number of the keys)
4. Commit your changes.
