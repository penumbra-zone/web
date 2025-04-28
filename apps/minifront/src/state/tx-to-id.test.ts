import { Transaction } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { describe, it } from 'vitest';
import { txToId } from './tx-to-id';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

describe('txToId', () => {
  it('should hash a transaction id', async () => {
    const transaction = new Transaction({});
    const hash = await txToId(transaction);
    expect(uint8ArrayToHex(hash.inner)).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });
});
