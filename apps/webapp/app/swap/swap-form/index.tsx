import { useState } from 'react';
import { Button } from '@penumbra-zone/ui';
import { FilledImage } from '../../../shared';
import { useStore } from '../../../state';
import { SwapInputs, swapSelector } from '../../../state/swap';
import dynamic from 'next/dynamic';
import { cn } from '@penumbra-zone/ui/lib/utils';

const SwapInput = dynamic(() => import('./swap-input'), { ssr: false });

export default function SwapForm() {
  const [isHoveringSwitchButton, setHoveringSwitchButton] = useState(false);

  const { pay, receive, validationErrors, setAmount, setAsset, replaceAsset } =
    useStore(swapSelector);

  // TODO: Fix later
  // useCalculateBalance(pay.asset, setAssetBalance);

  return (
    <form
      className='flex flex-col gap-10'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <div className='relative flex flex-col md:gap-4 xl:gap-2'>
        <SwapInput
          placeholder='Enter an amount'
          asset={{ ...pay, price: 10 }}
          setAsset={setAsset(SwapInputs.PAY)}
          onChange={e => {
            if (Number(e.target.value) < 0) return;
            setAmount(SwapInputs.PAY)(e.target.value);
            setAmount(SwapInputs.RECEIVE)(
              e.target.value ? String(Number(e.target.value) / 10) : '',
            );
          }}
          validations={[
            {
              type: 'error',
              issue: 'insufficient funds',
              // TODO: should be derviing validationErrors like send form
              checkFn: () => false,
            },
          ]}
        />
        <Button
          variant='ghost'
          className='absolute left-[calc(50%-20px)] top-[calc(50%-20px)] transition-all duration-500 hover:bg-transparent'
          onClick={replaceAsset}
          onMouseEnter={() => setHoveringSwitchButton(true)}
          onMouseLeave={() => setHoveringSwitchButton(false)}
        >
          <FilledImage
            src='/arrow-down.svg'
            className={cn(
              'h-10 w-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-bounce',
              isHoveringSwitchButton && 'rotate-180 opacity-0',
            )}
            alt='Arrow'
          />
          <FilledImage
            src='/arrow-replace.svg'
            className={cn(
              'h-11 w-11 transition-all duration-500 ease-bounce',
              isHoveringSwitchButton && 'rotate-180 opacity-100',
              !isHoveringSwitchButton && 'opacity-0',
            )}
            alt='Arrow'
          />
        </Button>
        <SwapInput
          placeholder='0.00'
          asset={{ ...receive, price: 0.1 }}
          setAsset={setAsset(SwapInputs.RECEIVE)}
          readOnly
        />
      </div>
      <Button
        type='submit'
        variant='gradient'
        disabled={
          !Number(pay.amount) || !receive.amount || !!Object.values(validationErrors).find(Boolean)
        }
      >
        {validationErrors.pay ? `Insufficient ${pay.asset.display} balance` : 'Swap'}
      </Button>
    </form>
  );
}
