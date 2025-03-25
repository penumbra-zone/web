import type { Impl } from './index.js';
import { create, equals } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax.js';

import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { addAmounts, joinLoHiAmount } from '@penumbra-zone/types/amount';
import { AssetIdSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressIndexSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const notes: Impl['notes'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const { assetId, addressIndex, includeSpent, amountToSpend } = req;

  let spent = create(AmountSchema);

  for await (const n of indexedDb.iterateSpendableNotes()) {
    if (
      assetId &&
      (!n.note?.value?.assetId || !equals(AssetIdSchema, n.note.value.assetId, assetId))
    ) {
      continue;
    }
    if (
      addressIndex &&
      (!n.addressIndex || !equals(AddressIndexSchema, n.addressIndex, addressIndex))
    ) {
      continue;
    }
    if (!includeSpent && n.heightSpent !== 0n) {
      continue;
    }

    yield { noteRecord: n };

    // If set, stop returning notes once the total exceeds this amount.
    // Ignored if `assetId` is unset or if `includeSpent` is set.
    if (amountToSpend && assetId && !includeSpent) {
      const noteAmount = n.note?.value?.amount ?? create(AmountSchema);
      spent = addAmounts(spent, noteAmount);
      if (joinLoHiAmount(spent) >= joinLoHiAmount(amountToSpend)) {
        break;
      }
    }
  }
};
