import { FilledImage, InputToken } from '../../shared';
import { useStore } from '../../state';
import { SwapToken, swapSelector } from '../../state/swap';
import { Button } from 'ui';
import { validateAmount } from '../../utils';

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
      <div className='flex flex-col gap-2 relative'>
        <InputToken
          label='You pay'
          placeholder='Enter an amount'
          asset={pay.asset}
          setAsset={setAsset(SwapToken.PAY)}
          value={pay.amount}
          onChange={e => {
            if (Number(e.target.value) < 0) return;
            setAmount(SwapToken.PAY)(e.target.value);
          }}
          validations={
            // if the user has no balance, do not confirm the validation
            pay.asset
              ? [
                  {
                    type: 'error',
                    issue: 'insufficient funds',
                    checkFn: (amount: string) => validateAmount(amount, pay.asset?.balance ?? 0),
                  },
                ]
              : undefined
          }
          inputClassName='text-3xl leading-10 font-bold h-10 w-[calc(100%-160px)] '
        />
        <Button
          variant='ghost'
          className='group absolute top-[calc(50%-20px)] left-[calc(50%-20px)] hover:bg-transparent'
          onClick={replaceAsset}
        >
          <FilledImage src='/arrow-down.svg' className='w-10 h-10 group-hover:hidden' alt='Arrow' />
          <FilledImage
            src='/arrow-replace.svg'
            className='w-10 h-10 hidden  group-hover:block'
            alt='Arrow'
          />
        </Button>
        <InputToken
          label='You receive'
          placeholder='Enter an amount'
          asset={receive.asset}
          setAsset={setAsset(SwapToken.RECEIVE)}
          value={receive.amount}
          onChange={e => {
            if (Number(e.target.value) < 0) return;
            setAmount(SwapToken.RECEIVE)(e.target.value);
          }}
          validations={
            // if the user has no balance, do not confirm the validation
            receive.asset
              ? [
                  {
                    type: 'error',
                    issue: 'insufficient funds',
                    checkFn: (amount: string) =>
                      validateAmount(amount, receive.asset?.balance ?? 0),
                  },
                ]
              : undefined
          }
          inputClassName='text-3xl leading-10 font-bold h-10 w-[calc(100%-160px)] '
        />
      </div>
      <Button
        type='submit'
        variant='gradient'
        disabled={
          !pay.asset ||
          !pay.amount ||
          !receive.asset ||
          !receive.amount ||
          !!Object.values(validationErrors).find(Boolean)
        }
      >
        Swap
      </Button>
    </form>
  );
};
