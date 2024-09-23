import {
  CommitmentSource,
  Nullifier,
} from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { StateCommitment } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';
import { SpendableNoteRecord, SwapRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Transaction } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { sha256Hash } from '@penumbra-zone/crypto-web/sha256';
import { MsgRecvPacket } from '@penumbra-zone/protobuf/ibc/core/channel/v1/tx_pb';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { FungibleTokenPacketData } from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';
import { compatAddressFromBech32, isCompatAddress } from '@penumbra-zone/bech32m/penumbracompat1';
import { ViewServerInterface } from '@penumbra-zone/types/servers';

const BLANK_TX_SOURCE = new CommitmentSource({
  source: { case: 'transaction', value: { id: new Uint8Array() } },
});

export const parseIntoAddr = (addrStr: string): Address => {
  if (isCompatAddress(addrStr)) {
    return new Address(compatAddressFromBech32(addrStr));
  }
  return new Address(addressFromBech32m(addrStr));
};

export const hasRelevantIbcRelay = (
  tx: Transaction,
  isControlledAddr: ViewServerInterface['isControlledAddress'],
) => {
  return tx.body?.actions.some(action => {
    if (action.action.case !== 'ibcRelayAction') {
      return false;
    }

    if (!action.action.value.rawAction?.is(MsgRecvPacket.typeName)) {
      return false;
    }

    const recvPacket = new MsgRecvPacket();
    const success = action.action.value.rawAction.unpackTo(recvPacket);
    if (!success) {
      throw new Error('Error while trying to unpack Any to MsgRecvPacket');
    }

    if (!recvPacket.packet?.data) {
      throw new Error('No FungibleTokenPacketData MsgRecvPacket');
    }

    try {
      const dataString = new TextDecoder().decode(recvPacket.packet.data);
      const { receiver } = FungibleTokenPacketData.fromJsonString(dataString);
      const receivingAddr = parseIntoAddr(receiver);
      return isControlledAddr(receivingAddr);
    } catch (e) {
      return false;
    }
  });
};

// Used as a type-check helper as .filter(Boolean) still results with undefined as a possible value
const isDefined = <T>(value: T | null | undefined): value is NonNullable<T> =>
  value !== null && value !== undefined;

export const getCommitmentsFromActions = (tx: Transaction): StateCommitment[] => {
  if (!tx.body?.actions) {
    return [];
  }

  return tx.body.actions
    .flatMap(({ action }) => {
      switch (action.case) {
        case 'output':
          return action.value.body?.notePayload?.noteCommitment;
        case 'swap':
          return action.value.body?.payload?.commitment;
        case 'swapClaim':
          return [action.value.body?.output1Commitment, action.value.body?.output2Commitment];
        default:
          return;
      }
    })
    .filter(isDefined);
};

export const getNullifiersFromActions = (tx: Transaction): Nullifier[] => {
  if (!tx.body?.actions) {
    return [];
  }

  return tx.body.actions
    .flatMap(({ action }) => {
      switch (action.case) {
        case 'spend':
        case 'swapClaim':
          return action.value.body?.nullifier;
        default:
          return;
      }
    })
    .filter(isDefined);
};

export interface RelevantTx {
  id: TransactionId;
  data: Transaction;
}

type RecoveredSourceRecords = (SpendableNoteRecord | SwapRecord)[];

const generateTxId = async (tx: Transaction): Promise<TransactionId> => {
  return new TransactionId({ inner: await sha256Hash(tx.toBinary()) });
};

const searchRelevant = async (
  tx: Transaction,
  spentNullifiers: Set<Nullifier>,
  commitmentRecords: Map<StateCommitment, SpendableNoteRecord | SwapRecord>,
  isControlledAddr: ViewServerInterface['isControlledAddress'],
): Promise<
  { relevantTx: RelevantTx; recoveredSourceRecords: RecoveredSourceRecords } | undefined
> => {
  let txId: TransactionId | undefined; // If set, that means this tx is relevant and should be returned to the caller
  const recoveredSourceRecords: RecoveredSourceRecords = [];

  const txNullifiers = getNullifiersFromActions(tx);
  for (const spentNullifier of spentNullifiers) {
    if (txNullifiers.some(txNullifier => spentNullifier.equals(txNullifier))) {
      txId ??= await generateTxId(tx);
    }
  }

  const txCommitments = getCommitmentsFromActions(tx);
  for (const [stateCommitment, spendableNoteRecord] of commitmentRecords) {
    if (txCommitments.some(txCommitment => stateCommitment.equals(txCommitment))) {
      txId ??= await generateTxId(tx);

      // Blank sources can be recovered by associating them with the transaction
      if (BLANK_TX_SOURCE.equals(spendableNoteRecord.source)) {
        const recovered = spendableNoteRecord.clone();
        recovered.source = new CommitmentSource({
          source: { case: 'transaction', value: { id: txId.inner } },
        });
        recoveredSourceRecords.push(recovered);
      }
    }
  }

  if (hasRelevantIbcRelay(tx, isControlledAddr)) {
    txId ??= await generateTxId(tx);
  }

  if (txId) {
    return {
      relevantTx: { id: txId, data: tx },
      recoveredSourceRecords,
    };
  }

  return undefined;
};

// identify transactions that involve a new record by comparing nullifiers and state commitments
// also returns records with recovered sources
export const identifyTransactions = async (
  spentNullifiers: Set<Nullifier>,
  commitmentRecords: Map<StateCommitment, SpendableNoteRecord | SwapRecord>,
  blockTx: Transaction[],
  isControlledAddr: ViewServerInterface['isControlledAddress'],
): Promise<{
  relevantTxs: RelevantTx[];
  recoveredSourceRecords: RecoveredSourceRecords;
}> => {
  const relevantTxs: RelevantTx[] = [];
  const recoveredSourceRecords: RecoveredSourceRecords = [];

  const searchPromises = blockTx.map(tx =>
    searchRelevant(tx, spentNullifiers, commitmentRecords, isControlledAddr),
  );
  const results = await Promise.all(searchPromises);

  for (const result of results) {
    if (result?.relevantTx) {
      relevantTxs.push(result.relevantTx);
    }
    if (result?.recoveredSourceRecords.length) {
      recoveredSourceRecords.push(...result.recoveredSourceRecords);
    }
  }
  return { relevantTxs, recoveredSourceRecords };
};
