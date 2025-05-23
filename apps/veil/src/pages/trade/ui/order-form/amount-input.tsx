import { useId, useEffect, useState, useRef } from 'react';
import { useComponentSize } from 'react-use-size';
import { Icon } from '@penumbra-zone/ui/Icon';
import { InfoIcon, WalletMinimal } from 'lucide-react';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import SpinnerIcon from '@/shared/assets/spinner-icon.svg';
import cn from 'clsx';
import { AssetInfo } from '../../model/AssetInfo';
import Image from 'next/image';

export interface AmountInputProps {
  id?: string;
  asset: AssetInfo;
  balance?: string;
  onBalanceClick?: () => void;
  isEstimating?: boolean;
  isApproximately?: boolean;
  value: string;
  onChange?: (amount: string, ...args: unknown[]) => void;
}

/**
 * The order form input field.
 */
export const AmountInput = ({
  ref,
  id: idProp,
  value,
  isEstimating,
  isApproximately,
  onChange,
  asset,
  balance,
  onBalanceClick,
}: AmountInputProps & {
  ref?: React.RefObject<HTMLInputElement>;
}) => {
  const { ref: denomRef, width: denomWidth } = useComponentSize();
  const textRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const reactId = useId();
  const id = idProp ?? reactId;

  useEffect(() => {
    requestAnimationFrame(() => {
      // useComponentSize doesnt set width correctly on updates
      setTextWidth(textRef.current?.offsetWidth ?? 0);
    });
  }, [value]);

  return (
    <div className='mb-2'>
      <div className='relative bg-gradient-to-r from-other-tonalFill5 to-other-tonalFill10 rounded-sm mb-1'>
        {isEstimating ? (
          <div className='flex items-center p-2 pl-3 pt-7 text-text-secondary animate-pulse'>
            <div className='flex items-center h-6 mr-1'>
              <SpinnerIcon className='animate-spin' />
            </div>
            <span className='font-default text-textSm font-normal leading-textXs'>
              Estimating...
            </span>
          </div>
        ) : (
          <>
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
                isApproximately && value ? 'pl-7' : undefined,
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
              ref={ref}
              id={id}
            />
            {isApproximately && value && (
              <>
                <span className='absolute font-default text-textLg font-medium !leading-[44px] text-secondary-light'>
                  ≈
                </span>
                <div className='absolute top-[31px]' style={{ left: textWidth + 8 * 4 }}>
                  <Tooltip message='Swap outputs are estimates based on current market prices.'>
                    <Icon IconComponent={InfoIcon} size='sm' color='text.primary' />
                  </Tooltip>
                </div>
              </>
            )}
          </>
        )}
        {asset.symbol && (
          <div
            ref={denomRef}
            className='flex items-center gap-1 absolute top-0 right-3 pointer-events-none z-[1] font-default text-textSm font-normal leading-textXs text-text-secondary !leading-[44px]'
          >
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- its necessary */}
            {asset.metadata?.images?.[0]?.svg && (
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
            <Icon IconComponent={WalletMinimal} size='xs' color='text.secondary' />
          </div>
          {balance}
        </button>
      )}
    </div>
  );
};

AmountInput.displayName = 'AmountInput';
