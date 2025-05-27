import React from 'react';
import { Link2 } from 'lucide-react';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { SectionComponentProps } from './TransactionView';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { Button } from '../Button';

const formatTxHash = (hash: string): string => {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
};

export const TransactionInfo: React.FC<SectionComponentProps> = ({ fullTxInfo }) => {
  const fullTxHash = fullTxInfo?.id?.inner ? uint8ArrayToHex(fullTxInfo.id.inner) : undefined;
  const blockHeight = fullTxInfo?.height ? String(fullTxInfo.height) : undefined;

  // Create explorer URLs
  const blockHeightUrl = blockHeight
    ? `https://explorer.penumbra.zone/block/${blockHeight}`
    : undefined;

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-start justify-between text-sm'>
        <div className='pt-0.5'>
          <span className='text-text-secondary font-mono text-sm'>Transaction Hash</span>
        </div>
        <div className='mx-2 grow border-b border-dashed border-other-tonalStroke pt-3'></div>
        <div className='flex items-center gap-1'>
          <div className='flex items-center gap-1 font-mono max-w-[250px]'>
            <span className='text-text-secondary font-mono text-sm truncate'>
              {fullTxHash ? formatTxHash(fullTxHash) : undefined}
            </span>
          </div>
          {fullTxHash && <CopyToClipboardButton text={fullTxHash} variant={'slim'} />}
        </div>
      </div>

      <div className='flex items-start justify-between text-sm'>
        <div className='pt-0.5'>
          <span className='text-text-secondary font-mono text-sm'>Block Height</span>
        </div>
        <div className='mx-2 grow border-b border-dashed border-other-tonalStroke pt-3'></div>
        <div className='flex items-center gap-1'>
          <a
            href={blockHeightUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1 hover:underline'
          >
            <span className='text-text-secondary font-mono text-sm'>{blockHeight}</span>
            <Button icon={Link2} iconOnly='adornment' density='compact'>
              Open block
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
