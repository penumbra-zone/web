import { useRef } from 'react';
import { useComponentSize } from 'react-use-size';
import { Icon } from '@penumbra-zone/ui/Icon';
import { WalletMinimal } from 'lucide-react';
import cn from 'clsx';
import { AssetInfo } from '../../model/AssetInfo';
import Image from 'next/image';

export interface AmountInputProps {
  value: string;
  onChange?: (amount: string, ...args: unknown[]) => void;
  asset?: AssetInfo;
  balance?: string;
  onBalanceClick?: () => void;
}

/**
 * The order form input field.
 */
export const AmountInput = ({
  value,
  onChange,
  asset,
  balance,
  onBalanceClick,
}: AmountInputProps) => {
  const { ref: denomRef, width: denomWidth } = useComponentSize();
  const textRef = useRef<HTMLDivElement>(null);

  return (
    <div className='mb-2'>
      <div className='relative bg-gradient-to-r from-other-tonalFill5 to-other-tonalFill10 rounded-sm mb-1'>
        <div
          ref={textRef}
          className='font-default text-textLg font-medium leading-textLg invisible absolute'
        >
          {value}
        </div>
        <input
          className={cn(
            'w-full appearance-none border-none bg-transparent',
            'rounded-sm text-text-primary transition-colors duration-150',
            'px-3 py-2',
            'font-default text-textLg font-medium leading-textLg',
            '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            "[&[type='number']]:[-moz-appearance:textfield]",
          )}
          style={{ paddingRight: denomWidth + 20 }}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onWheel={e => {
            // Remove focus to prevent scroll changes
            (e.target as HTMLInputElement).blur();
          }}
          type='number'
        />
        {asset?.symbol && (
          <div
            ref={denomRef}
            className='flex items-center gap-1 absolute top-0 right-3 pointer-events-none z-[1] font-default text-textSm font-normal leading-textXs text-text-secondary !leading-[44px]'
          >
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- its necessary */}
            {asset?.metadata?.images?.[0]?.svg && (
              <Image
                className='w-4 h-4 rounded-full'
                src={asset.metadata.images[0].svg}
                alt={asset.symbol}
                width={16}
                height={16}
              />
            )}
            {asset.symbol}
          </div>
        )}
      </div>
      {balance && (
        <button
          type='button'
          className='flex items-center gap-1 font-mono text-textXs font-normal leading-textXs text-text-secondary'
          onClick={onBalanceClick}
        >
          <div className='bg-other-tonalFill5 rounded-full w-[28px] h-[20px] flex items-center justify-center'>
            <Icon IconComponent={WalletMinimal} size='sm' color='text.secondary' />
          </div>
          {balance}
        </button>
      )}
    </div>
  );
};

AmountInput.displayName = 'AmountInput';
