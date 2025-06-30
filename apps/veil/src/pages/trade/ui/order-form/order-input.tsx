import { useId, useEffect, useState, useRef, KeyboardEvent } from 'react';
import { useComponentSize } from 'react-use-size';
import { round } from '@penumbra-zone/types/round';
import { Icon } from '@penumbra-zone/ui/Icon';
import { InfoIcon } from 'lucide-react';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import SpinnerIcon from '@/shared/assets/spinner-icon.svg';
import cn from 'clsx';

export interface OrderInputProps {
  id?: string;
  label: string;
  value: string;
  placeholder?: string;
  isEstimating?: boolean;
  isApproximately?: boolean;
  onChange?: (amount: string, ...args: unknown[]) => void;
  denominator?: string;
  max?: string | number;
  min?: string | number;
  disabled?: boolean;
  decimals?: number;
  round?: boolean;
}

/**
 * The order form input field.
 */
export const OrderInput = ({
  ref,
  id: idProp,
  label,
  value,
  placeholder,
  isEstimating,
  isApproximately,
  onChange,
  denominator,
  max,
  min,
  disabled,
  decimals,
  round: roundValue = false,
}: OrderInputProps & {
  ref?: React.RefObject<HTMLInputElement>;
}) => {
  const { ref: denomRef, width: denomWidth } = useComponentSize();
  const textRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const reactId = useId();
  const id = idProp ?? reactId;
  const roundedValue =
    roundValue && !isFocused
      ? round({
          value,
          decimals: decimals ?? 0,
        })
      : value;

  // prevent input from exceeding the specified number of decimals
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const key = parseInt(event.key);
    const decimalPart = roundedValue.split('.')[1] ?? '';
    if (!isNaN(key) && typeof decimals !== 'undefined' && decimalPart.length >= decimals) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      // useComponentSize doesnt set width correctly on updates
      setTextWidth(textRef.current?.offsetWidth ?? 0);
    });
  }, [roundedValue]);

  return (
    <div className='relative h-16 rounded-sm bg-linear-to-r from-other-tonal-fill5 to-other-tonal-fill10'>
      <label
        htmlFor={id}
        className='absolute top-2 left-3 z-1 font-default text-text-sm leading-text-xs font-normal text-text-secondary'
      >
        {label}
      </label>
      {isEstimating ? (
        <div className='flex animate-pulse items-center p-2 pt-7 pl-3 text-text-secondary'>
          <div className='mr-1 flex h-6 items-center'>
            <SpinnerIcon className='animate-spin' />
          </div>
          <span className='font-default text-text-sm leading-text-xs font-normal'>
            Estimating...
          </span>
        </div>
      ) : (
        <>
          <div
            ref={textRef}
            className='invisible absolute font-default text-text-lg leading-text-lg font-medium'
          >
            {roundedValue}
          </div>
          <input
            className={cn(
              'w-full appearance-none border-none bg-transparent',
              'rounded-sm text-text-primary transition-colors duration-150',
              'p-2 pt-7',
              isApproximately && roundedValue ? 'pl-7' : 'pl-3',
              'font-default text-text-lg leading-text-lg font-medium',
              !disabled &&
                'hover:bg-other-tonal-fill5 focus:bg-other-tonal-fill10 focus:outline-hidden',
              disabled && 'cursor-not-allowed',
              '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
              "[&[type='number']]:[-moz-appearance:textfield]",
            )}
            style={{ paddingRight: denomWidth + 20 }}
            value={roundedValue}
            disabled={disabled}
            onChange={e => onChange?.(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={onKeyDown}
            onWheel={e => {
              // Remove focus to prevent scroll changes
              (e.target as HTMLInputElement).blur();
            }}
            placeholder={placeholder}
            type='number'
            max={max}
            min={min}
            ref={ref}
            id={id}
          />
          {isApproximately && roundedValue && (
            <>
              <span className='absolute top-[27px] left-3 font-default text-text-lg leading-text-lg font-medium text-secondary-light'>
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
      {denominator && (
        <div
          ref={denomRef}
          className='pointer-events-none absolute top-0 right-3 z-1 font-default text-text-sm leading-[64px]! leading-text-xs font-normal text-text-secondary'
        >
          {denominator}
        </div>
      )}
    </div>
  );
};

OrderInput.displayName = 'OrderInput';
