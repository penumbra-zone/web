import { Button } from 'ui';
import { FilledImage } from '../../../shared';
import { useStore } from '../../../state';
import { SwapToken, swapSelector } from '../../../state/swap';
import { validateAmount } from '../../../utils';
import { SwapInput } from './swap-input';

export const SwapForm = () => {
  const { pay, receive, validationErrors, setAmount, setAsset, replaceAsset } =
    useStore(swapSelector);

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
          asset={pay.asset}
          setAsset={setAsset(SwapToken.PAY)}
          value={pay.amount}
          onChange={e => {
            if (Number(e.target.value) < 0) return;
            setAmount(SwapToken.PAY)(e.target.value);
            setAmount(SwapToken.RECEIVE)(String(Number(e.target.value) / 10));
          }}
          validations={[
            {
              type: 'error',
              issue: 'insufficient funds',
              checkFn: (amount: string) => validateAmount(amount, pay.asset.balance),
            },
          ]}
          showBalance
        />
        <Button
          variant='ghost'
          className='group absolute left-[calc(50%-20px)] top-[calc(50%-20px)] hover:bg-transparent'
          onClick={replaceAsset}
        >
          <FilledImage src='/arrow-down.svg' className='h-10 w-10 group-hover:hidden' alt='Arrow' />
          <FilledImage
            src='/arrow-replace.svg'
            className='hidden h-10 w-10  group-hover:block'
            alt='Arrow'
          />
        </Button>
        <SwapInput
          placeholder='0.00'
          asset={receive.asset}
          setAsset={setAsset(SwapToken.RECEIVE)}
          value={receive.amount}
          readOnly
        />
      </div>
      <Button
        type='submit'
        variant='gradient'
        disabled={!pay.amount || !receive.amount || !!Object.values(validationErrors).find(Boolean)}
      >
        {validationErrors.pay ? `Insufficient ${pay.asset.name} balance` : 'Swap'}
      </Button>
    </form>
  );
};
