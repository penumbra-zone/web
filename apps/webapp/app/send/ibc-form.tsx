import dynamic from 'next/dynamic';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui';
import { FilledImage } from '../../shared';
import { useStore } from '../../state';
import { ibcSelector } from '../../state/ibc';
import { validateAmount } from '../../utils';
import { chains } from './constants';
import { useCalculateBalance } from '../../hooks/calculate-balance';
const InputToken = dynamic(() => import('../../shared/input-token'), {
  ssr: false,
});

export default function IbcForm() {
  const {
    amount,
    asset,
    assetBalance,
    chain,
    validationErrors,
    setAmount,
    setAsset,
    setChain,
    setAssetBalance,
  } = useStore(ibcSelector);

  useCalculateBalance(asset, setAssetBalance);

  return (
    <form
      className='flex flex-col gap-2'
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        asset={{ ...asset, price: 10 }}
        assetBalance={assetBalance}
        setAsset={setAsset}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setAmount(e.target.value);
        }}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: (amount: string) => validateAmount(amount, assetBalance),
          },
        ]}
      />
      <div className='flex flex-col gap-3 rounded-lg border bg-background px-4 pb-5 pt-3'>
        <p className='text-base font-bold'>Chain</p>
        <Select
          value={chain?.name ?? ''}
          onValueChange={e => setChain(chains.find(i => i.name === e))}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select chain'>
              {chain && (
                <div className='flex gap-2'>
                  <FilledImage src={chain.icon} alt='Chain' className='h-5 w-5' />
                  <p className='mt-[2px] text-muted-foreground'>{chain.name}</p>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {chains.map((i, index) => (
              <SelectItem key={index} value={i.name}>
                <div className='flex gap-2'>
                  <FilledImage src={i.icon} alt='Chain' className='h-5 w-5' />
                  <p className='mt-[2px]'>{i.name}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type='submit'
        variant='gradient'
        className='mt-9'
        disabled={!Number(amount) || !chain || !!Object.values(validationErrors).find(Boolean)}
      >
        Send
      </Button>
    </form>
  );
}
