import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

import { Code, ConnectError } from '@connectrpc/connect';
import { CommitmentSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';

export const broadcastTransaction: Impl['broadcastTransaction'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { tendermint } = services.querier;
  const { indexedDb } = await services.getWalletServices();
  if (!req.transaction)
    throw new ConnectError('No transaction provided in request', Code.InvalidArgument);

  const encodedTx = req.transaction.toBinary();

  // start subscription early to prevent race condition
  const subscription = indexedDb.subscribe('SPENDABLE_NOTES');

  const hash = await tendermint.broadcastTx(encodedTx);

  // Wait until our DB encounters a new note with this hash
  if (req.awaitDetection) {
    for await (const update of subscription) {
      const note = SpendableNoteRecord.fromJson(update.value);
      const commitmentSource = new CommitmentSource({
        source: { value: { id: hash }, case: 'transaction' },
      });

      if (note.source?.equals(commitmentSource)) {
        return { id: { inner: hash }, detectionHeight: note.heightSpent };
      }
    }
  }

  return { id: { inner: hash } };
};
