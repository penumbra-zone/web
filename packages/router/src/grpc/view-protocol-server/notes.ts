import type { Impl } from '.';
import { hasWalletCtx, servicesCtx } from '../../ctx';

import { addAmounts, joinLoHiAmount } from '@penumbra-zone/types';

import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';

export const notes: Impl['notes'] = async function* (req, ctx) {
  const hasWallet = ctx.values.get(hasWalletCtx);
  await hasWallet(req.walletId);

  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const allNotes = await indexedDb.getAllNotes();

  const { assetId, addressIndex, includeSpent, amountToSpend } = req;

  let spent = new Amount();

  yield* allNotes
    .filter(n => (assetId ? n.note?.value?.assetId?.equals(assetId) : true))
    .filter(n => (addressIndex ? n.addressIndex?.equals(addressIndex) : true))
    .filter(n => (!includeSpent ? !n.heightSpent : true))
    .filter(n => {
      // If set, stop returning notes once the total exceeds this amount.
      // Ignored if `assetId` is unset or if `includeSpent` is set.
      if (!(amountToSpend && assetId && !includeSpent)) return true;

      const noteAmount = n.note?.value?.amount ?? new Amount();
      spent = addAmounts(spent, noteAmount);

      return joinLoHiAmount(spent) <= joinLoHiAmount(amountToSpend);
    })
    .map(noteRecord => ({ noteRecord }));
};
