import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { Transport, createPromiseClient } from '@connectrpc/connect';
import { sha256Hash } from '@penumbra-zone/crypto-web/sha256';
import { TendermintProxyService } from '@penumbra-zone/protobuf';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

export const queryTransaction = async (fullnode: Transport, id: TransactionId) => {
  const tendermintClient = createPromiseClient(TendermintProxyService, fullnode);

  const { height, tx: txBin } = await tendermintClient.getTx({ hash: id.inner });

  return { height, transaction: Transaction.fromBinary(txBin) };
};

export const publishTransaction = async (fullnode: Transport, tx: Transaction) => {
  const tendermintClient = createPromiseClient(TendermintProxyService, fullnode);

  const params = tx.toBinary();

  // Note that "synchronous" here means "wait for the tx to be accepted by
  // the fullnode", not "wait for the tx to be included on chain.
  const { hash, log, code } = await tendermintClient.broadcastTxSync({ params });

  const expectedId = new TransactionId({ inner: await sha256Hash(params) });
  if (!expectedId.equals({ inner: hash })) {
    throw new Error(
      `broadcast transaction id disagrees: expected ${uint8ArrayToHex(expectedId.inner)} but tendermint ${uint8ArrayToHex(hash)}`,
    );
  }

  if (code !== 0n) {
    throw new Error(`Tendermint error ${code.toString()}: ${log}`);
  }

  return new TransactionId({ inner: hash });
};
