import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { addAmounts, joinLoHiAmount } from '@penumbra-zone/types';

import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';

export const notes: Impl['notes'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();

  const { assetId, addressIndex, includeSpent, amountToSpend } = req;

  let spent = new Amount();

  for await (const n of indexedDb.iterateSpendableNotes()) {
    console.log(n)
    if (assetId && !n.note?.value?.assetId?.equals(assetId)) continue;
    if (addressIndex && !n.addressIndex?.equals(addressIndex)) continue;
    if (!includeSpent && n.heightSpent) continue;

    // If set, stop returning notes once the total exceeds this amount.
    // Ignored if `assetId` is unset or if `includeSpent` is set.
    if (amountToSpend && assetId && !includeSpent) {
      const noteAmount = n.note?.value?.amount ?? new Amount();
      spent = addAmounts(spent, noteAmount);
      if (joinLoHiAmount(spent) <= joinLoHiAmount(amountToSpend)) continue;
    }

    yield { noteRecord: n };
  }
};
