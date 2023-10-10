import { Base64Str, base64ToUint8Array } from '../base64';
import { DecodedTransaction } from './decoded';
import { TransactionView, txViewToProto } from './view';
import {
  TransactionInfo,
  TransactionInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  Id,
  Transaction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';
import { txBodyToProto } from './body';
import { perspectiveToProto, TransactionPerspective } from './perspective';

export interface StoredTransaction {
  blockHeight: bigint;
  id: Base64Str;
  tx: DecodedTransaction;
  perspective: TransactionPerspective;
  view: TransactionView;
}

export const idToProto = (id: Base64Str): Id => new Id({ hash: base64ToUint8Array(id) });

export const storedTransactionToProto = (t: StoredTransaction): TransactionInfoResponse => {
  return new TransactionInfoResponse({
    txInfo: new TransactionInfo({
      id: idToProto(t.id),
      height: t.blockHeight,
      transaction: new Transaction({
        body: txBodyToProto(t.tx.body),
        bindingSig: base64ToUint8Array(t.tx.bindingSig),
        anchor: new MerkleRoot({ inner: base64ToUint8Array(t.tx.anchor.inner) }),
      }),
      perspective: perspectiveToProto(t.perspective),
      view: txViewToProto(t.view),
    }),
  });
};
