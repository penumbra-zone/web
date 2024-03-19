import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { Pill } from '../../pill';
import { uint8ArrayToHex } from '@penumbra-zone/types/src/hex';
import { shorten } from '@penumbra-zone/types/src/string';
import { ReactNode } from 'react';

/**
 * Renders a SHA-256 hash of a transaction ID in a pill.
 */
export const TransactionIdComponent = ({
  transactionId,
  prefix,
  shaClassName,
}: {
  transactionId: TransactionId;
  /** Anything to render before the SHA, like a label and/or icon */
  prefix?: ReactNode;
  /** Classes to apply to the <span> wrapping the SHA */
  shaClassName?: string;
}) => {
  const sha = uint8ArrayToHex(transactionId.inner);
  return (
    <Pill to={`/tx/${sha}`}>
      {prefix}
      <span className={shaClassName}>{shorten(sha, 8)}</span>
    </Pill>
  );
};
