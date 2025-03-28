import { forwardRef, useId, useEffect, useState, useRef } from 'react';
import { useComponentSize } from 'react-use-size';
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
}

/**
 * The order form input field.
 */
export const OrderInput = forwardRef<HTMLInputElement, OrderInputProps>(
  (
    {
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
    }: OrderInputProps,
    ref,
  ) => {
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
      <div className='relative h-16 bg-gradient-to-r from-other-tonalFill5 to-other-tonalFill10 rounded-sm'>
        <label
          htmlFor={id}
          className='absolute top-2 left-3 z-[1] font-default text-textSm font-normal leading-textXs text-text-secondary'
        >
          {label}
        </label>
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
                'p-2 pt-7',
                isApproximately && value ? 'pl-7' : 'pl-3',
                'font-default text-textLg font-medium leading-textLg',
                !disabled &&
                  'hover:bg-other-tonalFill5 focus:outline-none focus:bg-other-tonalFill10',
                disabled && 'cursor-not-allowed',
                '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                "[&[type='number']]:[-moz-appearance:textfield]",
              )}
              style={{ paddingRight: denomWidth + 20 }}
              value={value}
              disabled={disabled}
              onChange={e => onChange?.(e.target.value)}
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
            {isApproximately && value && (
              <>
                <span className='absolute top-[27px] left-3 font-default text-textLg font-medium leading-textLg text-secondary-light'>
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
            className='absolute top-0 right-3 pointer-events-none z-[1] font-default text-textSm font-normal leading-textXs text-text-secondary !leading-[64px]'
          >
            {denominator}
          </div>
        )}
      </div>
    );
  },
);

OrderInput.displayName = 'OrderInput';
