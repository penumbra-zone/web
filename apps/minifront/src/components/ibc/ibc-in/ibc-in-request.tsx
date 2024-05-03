import { useChainConnector, useCosmosChainBalances } from './hooks';
import { useStore } from '../../../state';
import { ibcErrorSelector, ibcInSelector, isReadySelector } from '../../../state/ibc-in';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@penumbra-zone/ui/components/ui/select';
import { Avatar, AvatarImage } from '@penumbra-zone/ui/components/ui/avatar';
import { Identicon } from '@penumbra-zone/ui/components/ui/identicon';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { DestinationAddr } from './destination-addr';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { LockClosedIcon } from '@radix-ui/react-icons';

export const IbcInRequest = () => {
  const { address, getSigningStargateClient } = useChainConnector();
  const { selectedChain, setCoin, issueTx } = useStore(ibcInSelector);
  const { data } = useCosmosChainBalances();

  const { isUnsupportedAsset } = useStore(ibcErrorSelector);
  const isReady = useStore(isReadySelector);

  // User is not ready to issue request
  if (!address || !selectedChain || !data?.length) return <></>;

  return (
    <div className='flex flex-col items-center gap-2'>
      <div className='font-bold text-stone-700'>Issue Ibc-in Request</div>
      {isUnsupportedAsset && (
        <div className='justify-center rounded bg-amber-200 p-2 text-center italic text-stone-700'>
          Note: only <b>native</b> assets at this time are eligible for ibc&apos;ing in. Unwind them
          through their home chain to get them to Penumbra.
        </div>
      )}
      <div className='flex w-full gap-2'>
        <Select onValueChange={v => setCoin(data.find(b => b.displayDenom === v))}>
          <SelectTrigger className='truncate rounded-lg bg-white p-2' textColor='text-stone-700'>
            <SelectValue placeholder='Select Asset' />
          </SelectTrigger>
          <SelectContent className='max-w-52 bg-white text-stone-700'>
            {data.map(b => {
              return (
                <SelectItem value={b.displayDenom} key={b.displayDenom} className='p-2'>
                  <div className='flex gap-2 text-stone-700'>
                    <Avatar className='size-6'>
                      <AvatarImage src={b.icon} />
                      <Identicon uniqueIdentifier={b.displayDenom} type='gradient' size={22} />
                    </Avatar>
                    <span className=''>{b.displayDenom}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <AmountInput />
      </div>
      <DestinationAddr />
      <Button
        variant='onLight'
        disabled={!isReady}
        className='w-full'
        onClick={() => void issueTx(address, getSigningStargateClient)}
      >
        <div className='flex items-center gap-2'>
          <LockClosedIcon />
          <span className='-mb-1'>Shield Assets</span>
        </div>
      </Button>
    </div>
  );
};

const AmountInput = () => {
  const { setAmount, coin } = useStore(ibcInSelector);
  const { amountErr } = useStore(ibcErrorSelector);

  return (
    <Input
      disabled={!coin}
      type='number'
      placeholder='Enter amount'
      className='bg-white text-stone-700'
      variant={amountErr ? 'error' : 'default'}
      onChange={e => setAmount(e.target.value)}
    />
  );
};
