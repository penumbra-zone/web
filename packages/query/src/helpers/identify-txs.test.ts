import { describe, expect, test } from 'vitest';
import {
  CommitmentSource,
  Nullifier,
} from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { StateCommitment } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';
import {
  Action,
  Transaction,
  TransactionBody,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import {
  getCommitmentsFromActions,
  getNullifiersFromActions,
  identifyTransactions,
} from './identify-txs.js';
import {
  Output,
  OutputBody,
  Spend,
  SpendBody,
} from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  Swap,
  SwapBody,
  SwapClaim,
  SwapClaimBody,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { SpendableNoteRecord, SwapRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

const BLANK_TX_SOURCE = new CommitmentSource({
  source: { case: 'transaction', value: { id: new Uint8Array() } },
});

describe('getCommitmentsFromActions', () => {
  test('returns empty array when tx.body.actions is undefined', () => {
    const tx = new Transaction();
    const commitments = getCommitmentsFromActions(tx);
    expect(commitments).toEqual([]);
  });

  test('returns noteCommitment from output actions', () => {
    const noteCommitment = new StateCommitment({ inner: new Uint8Array([1, 2, 3]) });
    const outputAction = new Action({
      action: {
        case: 'output',
        value: new Output({
          body: new OutputBody({
            notePayload: {
              noteCommitment,
            },
          }),
        }),
      },
    });

    const tx = new Transaction({
      body: new TransactionBody({
        actions: [outputAction],
      }),
    });

    const commitments = getCommitmentsFromActions(tx);
    expect(commitments).toEqual([noteCommitment]);
  });

  test('returns commitment from swap actions', () => {
    const commitment = new StateCommitment({ inner: new Uint8Array([4, 5, 6]) });
    const swapAction = new Action({
      action: {
        case: 'swap',
        value: new Swap({
          body: new SwapBody({
            payload: {
              commitment,
            },
          }),
        }),
      },
    });

    const tx = new Transaction({
      body: new TransactionBody({
        actions: [swapAction],
      }),
    });

    const commitments = getCommitmentsFromActions(tx);
    expect(commitments).toEqual([commitment]);
  });

  test('returns output commitments from swapClaim actions', () => {
    const output1Commitment = new StateCommitment({ inner: new Uint8Array([7, 8, 9]) });
    const output2Commitment = new StateCommitment({ inner: new Uint8Array([10, 11, 12]) });

    const swapClaimAction = new Action({
      action: {
        case: 'swapClaim',
        value: new SwapClaim({
          body: new SwapClaimBody({
            output1Commitment,
            output2Commitment,
          }),
        }),
      },
    });

    const tx = new Transaction({
      body: new TransactionBody({
        actions: [swapClaimAction],
      }),
    });

    const commitments = getCommitmentsFromActions(tx);
    expect(commitments).toEqual([output1Commitment, output2Commitment]);
  });

  test('ignores actions without commitments', () => {
    const unknownAction = new Action({
      action: {
        case: 'validatorDefinition',
        value: {},
      },
    });

    const tx = new Transaction({
      body: new TransactionBody({
        actions: [unknownAction],
      }),
    });

    const commitments = getCommitmentsFromActions(tx);
    expect(commitments).toEqual([]);
  });
});

describe('getNullifiersFromActions', () => {
  test('returns empty array when tx.body.actions is undefined', () => {
    const tx = new Transaction();
    const nullifiers = getNullifiersFromActions(tx);
    expect(nullifiers).toEqual([]);
  });

  test('returns nullifier from spend actions', () => {
    const nullifier = new Nullifier({ inner: new Uint8Array([1, 2, 3]) });
    const spendAction = new Action({
      action: {
        case: 'spend',
        value: new Spend({
          body: new SpendBody({
            nullifier,
          }),
        }),
      },
    });

    const tx = new Transaction({
      body: new TransactionBody({
        actions: [spendAction],
      }),
    });

    const nullifiers = getNullifiersFromActions(tx);
    expect(nullifiers).toEqual([nullifier]);
  });

  test('returns nullifier from swapClaim actions', () => {
    const nullifier = new Nullifier({ inner: new Uint8Array([4, 5, 6]) });
    const swapClaimAction = new Action({
      action: {
        case: 'swapClaim',
        value: new SwapClaim({
          body: new SwapClaimBody({
            nullifier,
          }),
        }),
      },
    });

    const tx = new Transaction({
      body: new TransactionBody({
        actions: [swapClaimAction],
      }),
    });

    const nullifiers = getNullifiersFromActions(tx);
    expect(nullifiers).toEqual([nullifier]);
  });

  test('ignores actions without nullifiers', () => {
    const outputAction = new Action({
      action: {
        case: 'output',
        value: new Output(),
      },
    });

    const tx = new Transaction({
      body: new TransactionBody({
        actions: [outputAction],
      }),
    });

    const nullifiers = getNullifiersFromActions(tx);
    expect(nullifiers).toEqual([]);
  });
});

describe('identifyTransactions', () => {
  test('returns empty arrays when no relevant transactions are found', async () => {
    const tx = new Transaction();
    const blockTx = [tx];
    const spentNullifiers = new Set<Nullifier>();
    const commitmentRecords = new Map<StateCommitment, SpendableNoteRecord | SwapRecord>();

    const result = await identifyTransactions(spentNullifiers, commitmentRecords, blockTx);

    expect(result.relevantTxs).toEqual([]);
    expect(result.recoveredSourceRecords).toEqual([]);
  });

  test('identifies relevant transactions and recovers sources', async () => {
    // Transaction 1: Matching nullifier
    const nullifier = new Nullifier({ inner: new Uint8Array([1, 2, 3]) });
    const tx1 = new Transaction({
      body: new TransactionBody({
        actions: [
          new Action({
            action: {
              case: 'spend',
              value: new Spend({
                body: new SpendBody({
                  nullifier,
                }),
              }),
            },
          }),
        ],
      }),
    });

    // Transaction 2: Matching commitment
    const commitment = new StateCommitment({ inner: new Uint8Array([4, 5, 6]) });
    const tx2 = new Transaction({
      body: new TransactionBody({
        actions: [
          new Action({
            action: {
              case: 'output',
              value: new Output({
                body: new OutputBody({
                  notePayload: {
                    noteCommitment: commitment,
                  },
                }),
              }),
            },
          }),
        ],
      }),
    });

    // Transaction 3: Irrelevant commitment
    const tx3 = new Transaction({
      body: new TransactionBody({
        actions: [
          new Action({
            action: {
              case: 'output',
              value: new Output({
                body: new OutputBody({
                  notePayload: {
                    noteCommitment: new StateCommitment({ inner: new Uint8Array([7, 8, 9]) }),
                  },
                }),
              }),
            },
          }),
        ],
      }),
    });

    // Transaction 4: Irrelevant nullifier
    const tx4 = new Transaction({
      body: new TransactionBody({
        actions: [
          new Action({
            action: {
              case: 'spend',
              value: new Spend({
                body: new SpendBody({
                  nullifier: new Nullifier({ inner: new Uint8Array([4, 5, 6]) }),
                }),
              }),
            },
          }),
        ],
      }),
    });

    const spentNullifiers = new Set<Nullifier>([nullifier]);

    const spendableNoteRecord = new SpendableNoteRecord({
      source: BLANK_TX_SOURCE,
    });

    const commitmentRecords = new Map<StateCommitment, SpendableNoteRecord | SwapRecord>([
      [commitment, spendableNoteRecord], // Expecting match
      [new StateCommitment({ inner: new Uint8Array([1, 6, 9]) }), new SpendableNoteRecord()], // not expecting match
    ]);

    const spentNullifiersBeforeSize = spentNullifiers.size;
    const commitmentRecordsBeforeSize = commitmentRecords.size;
    const result = await identifyTransactions(spentNullifiers, commitmentRecords, [
      tx1, // relevant
      tx2, // relevant
      tx3, // not
      tx4, // not
    ]);

    expect(result.relevantTxs.length).toBe(2);
    expect(result.recoveredSourceRecords.length).toBe(1);

    // Source was recovered
    expect(result.recoveredSourceRecords[0]!.source?.equals(BLANK_TX_SOURCE)).toEqual(false);

    // Expect inputs where not mutated
    expect(spentNullifiersBeforeSize).toEqual(spentNullifiers.size);
    expect(commitmentRecordsBeforeSize).toEqual(commitmentRecords.size);
  });
});
