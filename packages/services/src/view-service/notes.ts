import type { Impl } from '.';

import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { addAmounts, joinLoHiAmount } from '@penumbra-zone/types/amount';
import { dbCtx } from '../ctx/database';

export const notes: Impl['notes'] = async function* (req, ctx) {
  const indexedDb = await ctx.values.get(dbCtx)();

  const { assetId, addressIndex, includeSpent, amountToSpend } = req;

  let spent = new Amount();

  for await (const n of indexedDb.iterateSpendableNotes()) {
    if (assetId && !n.note?.value?.assetId?.equals(assetId)) continue;
    if (addressIndex && !n.addressIndex?.equals(addressIndex)) continue;
    if (!includeSpent && n.heightSpent !== 0n) continue;

    yield { noteRecord: n };

    // If set, stop returning notes once the total exceeds this amount.
    // Ignored if `assetId` is unset or if `includeSpent` is set.
    if (amountToSpend && assetId && !includeSpent) {
      const noteAmount = n.note?.value?.amount ?? new Amount();
      spent = addAmounts(spent, noteAmount);
      if (joinLoHiAmount(spent) >= joinLoHiAmount(amountToSpend)) break;
    }
  }
};
