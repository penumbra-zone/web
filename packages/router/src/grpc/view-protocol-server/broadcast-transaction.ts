import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

import { ConnectError, Code } from '@connectrpc/connect';

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
      if (note.source?.equals(new NoteSource({ inner: hash }))) break;
    }
  }

  return { id: { hash } };
};
