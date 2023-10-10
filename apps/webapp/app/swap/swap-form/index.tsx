import { LoHi, uint8ArrayToBase64 } from 'penumbra-types';
import { useEffect, useState } from 'react';
import { Button } from 'ui';
import { FilledImage } from '../../../shared';
import { useStore } from '../../../state';
import { SwapInputs, swapSelector } from '../../../state/swap';
import { calculateBalance, validateAmount } from '../../../utils';
import dynamic from 'next/dynamic';
import { useBalances } from '../../../hooks/balances';
import { cn } from 'ui/lib/utils';
const SwapInput = dynamic(() => import('./swap-input'), {
  ssr: false,
});

export default function SwapForm() {
  const [isHoveringSwitchButton, setHoveringSwitchButton] = useState(false);

  const { pay, receive, validationErrors, setAmount, setAsset, replaceAsset, setAssetBalance } =
    useStore(swapSelector);

  const { data, end } = useBalances({ account: 0 });

  useEffect(() => {
    if (!end) return;
    const selectedAsset = data.find(
      i =>
        i.balance?.assetId?.inner &&
        uint8ArrayToBase64(i.balance.assetId.inner) === pay.asset.penumbraAssetId.inner,
    );

    if (!selectedAsset) {
      setAssetBalance(0);
      return;
    }

    const loHi: LoHi = {
      lo: selectedAsset.balance?.amount?.lo ?? 0n,
      hi: selectedAsset.balance?.amount?.hi ?? 0n,
    };

    setAssetBalance(calculateBalance(loHi, pay.asset));
  }, [data, end, pay.asset, setAssetBalance]);

  return (
    <form
      className='flex flex-col gap-10'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <div className='relative flex flex-col gap-2'>
        <SwapInput
          placeholder='Enter an amount'
          asset={{ ...pay, price: 10 }}
          setAsset={setAsset(SwapInputs.PAY)}
          onChange={e => {
            if (Number(e.target.value) < 0) return;
            setAmount(SwapInputs.PAY)(e.target.value);
            setAmount(SwapInputs.RECEIVE)(String(Number(e.target.value) / 10));
          }}
          validations={[
            {
              type: 'error',
              issue: 'insufficient funds',
              checkFn: (amount: string) => validateAmount(amount, pay.balance!),
            },
          ]}
        />
        <Button
          variant='ghost'
          className='group absolute left-[calc(50%-20px)] top-[calc(50%-20px)] hover:bg-transparent transition-all duration-500 ease-bounce'
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
        disabled={!pay.amount || !receive.amount || !!Object.values(validationErrors).find(Boolean)}
      >
        {validationErrors.pay ? `Insufficient ${pay.asset.display} balance` : 'Swap'}
      </Button>
    </form>
  );
}
