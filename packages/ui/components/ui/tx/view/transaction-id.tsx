import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { Pill } from '../../pill';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { shorten } from '@penumbra-zone/types/string';

/**
 * Renders a SHA-256 hash of a transaction ID in a pill.
 */
export const TransactionIdComponent = ({ transactionId }: { transactionId: TransactionId }) => {
  const sha = uint8ArrayToHex(transactionId.inner);
  return (
    <Pill to={`/tx/${sha}`}>
      <span className='font-mono'>{shorten(sha, 8)}</span>
    </Pill>
  );
};
