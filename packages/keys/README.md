# `@penumbra-zone/keys`

This package contains cryptographic keys relevant to the Penumbra blockchain.

## Exports

The default export is a JSON mapping of Penumbra `Action` names to their
relevant key, necessary for building cryptographic proofs for those actions.

Individual keys are also exported at `@penumbra-zone/keys/[key_name]_pk.bin`.

## Using with a bundler

You could configure your bundler to understand the exported key 'modules' as
assets, or, if your bundler supports `import.meta.resolve` you can resolve the
path and fetch it.

```ts
const fetchConvertPk = await fetch(import.meta.resolve('@penumbra-zone/keys/convert_pk.bin'));
const convertPk = new Uint8Array(await fetchConvertPk.arrayBuffer());
```

For a more generic technique, the root export maps action type names to the
relevant key filename. Note that not every action has an associated proving key.

```ts
import { Action } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import actionKeys from '@penumbra-zone/keys';

async function getActionProvingKey({ action }: Action) {
  const actionName = action.case;
  const keyName = actionKeys[actionName];
  if (keyName) {
    const fetchKey = await fetch(import.meta.resolve(keyName, '@penumbra-zone/keys'));
    const pk = new Uint8Array(await fetchKey.arrayBuffer());
    return pk;
  }
}
```
