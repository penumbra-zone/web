import React from 'react';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { DetailRow } from './DetailRow';
import { SectionComponentProps } from './TransactionView';

export const TransactionInfo: React.FC<SectionComponentProps> = ({ fullTxInfo }) => {
  const txHash = fullTxInfo?.id?.inner ? uint8ArrayToHex(fullTxInfo.id.inner) : undefined;
  const blockHeight = fullTxInfo?.height ? String(fullTxInfo.height) : undefined;

  return (
    <div className='flex flex-col gap-1'>
      <DetailRow label='Transaction Hash' value={txHash} showCopy />
      <DetailRow label='Block Height' value={blockHeight} />
    </div>
  );
};
