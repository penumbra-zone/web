import React from 'react';
import { Link2 } from 'lucide-react';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { SectionComponentProps } from './TransactionView';
import { CopyToClipboardButton } from '@penumbra-zone/ui/CopyToClipboardButton';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Density } from '@penumbra-zone/ui/Density';

const formatTxHash = (hash: string): string => {
  if (hash.length <= 16) {
    return hash;
  }
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
};

const formatTimestamp = (date: Date): string => {
  // Format as YYYY-MM-DD HH:MM:SS UTC
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
};

const formatBlockHeight = (height: string): string => {
  // Add comma formatting for numbers
  return height.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const TransactionInfo: React.FC<SectionComponentProps> = ({
  fullTxInfo,
  blockTimestamp,
}) => {
  const fullTxHash = fullTxInfo?.id?.inner ? uint8ArrayToHex(fullTxInfo.id.inner) : undefined;
  const blockHeight = fullTxInfo?.height ? String(fullTxInfo.height) : undefined;

  // Use text-secondary color for all text
  const textColorClass = 'text.secondary';

  return (
    <div className='flex w-full flex-col'>
      <Density></Density>
      <div className='flex items-start justify-between text-sm'>
        <div className='pt-0.5'>
          <Text variant='smallTechnical' color={textColorClass}>
            Transaction Hash
          </Text>
        </div>
        <div className='mx-2 grow border-b border-dashed border-other-tonal-stroke pt-3'></div>
        <div className='flex items-center gap-1'>
          <div className='flex max-w-[250px] items-center gap-1'>
            <Text variant='smallTechnical' truncate color={textColorClass}>
              {fullTxHash ? formatTxHash(fullTxHash) : undefined}
            </Text>
          </div>
          {fullTxHash && (
            <Density slim>
              {' '}
              <CopyToClipboardButton text={fullTxHash} />
            </Density>
          )}
        </div>
      </div>

      <div className='flex items-start justify-between text-sm'>
        <div className='pt-0.5'>
          <Text variant='smallTechnical' color={textColorClass}>
            Block Height
          </Text>
        </div>
        <div className='mx-2 grow border-b border-dashed border-other-tonal-stroke pt-3'></div>
        <div className='flex items-center gap-1'>
          <a
            href={`https://penumbra.zone/block/${blockHeight}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1 hover:underline'
          >
            <Text variant='smallTechnical' color={textColorClass}>
              {blockHeight ? formatBlockHeight(blockHeight) : undefined}
            </Text>
            <Button icon={Link2} iconOnly='adornment' density='slim'>
              Open block
            </Button>
          </a>
        </div>
      </div>

      {blockTimestamp && (
        <div className='flex items-start justify-between text-sm'>
          <div className='pt-0.5'>
            <Text variant='smallTechnical' color={textColorClass}>
              Time
            </Text>
          </div>
          <div className='mx-2 grow border-b border-dashed border-other-tonal-stroke pt-3'></div>
          <div className='flex items-center gap-1'>
            <Text variant='smallTechnical' color={textColorClass}>
              {formatTimestamp(blockTimestamp)}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};
